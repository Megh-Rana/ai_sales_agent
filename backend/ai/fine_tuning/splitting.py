"""
Dataset Splitting & Leakage Prevention — AI-11.

Provides deterministic train/validation/test splitting with conversation-level
grouping to avoid conversational turn leakage, and cross-split overlap verification.
"""

from __future__ import annotations

import random
import re
from typing import Dict, List, Set, Tuple
from ai.fine_tuning.schemas import DatasetSplit, DatasetSplitError, TrainingExample


def normalize_text_for_dedup(text: str) -> str:
    """Normalize text by lowercasing and collapsing whitespace."""
    return re.sub(r"\s+", " ", text.strip().lower())


class DatasetSplitter:
    """
    Deterministically splits training examples into train, validation, and test sets.
    Preserves conversation boundaries (conversation-level grouping) and guards
    against cross-split leakage.
    """

    def __init__(
        self,
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
        test_ratio: float = 0.1,
        seed: int = 42,
    ):
        if not (0.0 < train_ratio < 1.0):
            raise ValueError(f"train_ratio must be between 0.0 and 1.0, got {train_ratio}")
        if not (0.0 <= val_ratio < 1.0):
            raise ValueError(f"val_ratio must be between 0.0 and 1.0, got {val_ratio}")
        if not (0.0 <= test_ratio < 1.0):
            raise ValueError(f"test_ratio must be between 0.0 and 1.0, got {test_ratio}")

        total = round(train_ratio + val_ratio + test_ratio, 4)
        if total != 1.0:
            raise ValueError(f"Sum of ratios must equal 1.0, got {total}")

        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.seed = seed

    def split(self, examples: List[TrainingExample]) -> DatasetSplit:
        """
        Split a list of training examples deterministically using the configured seed.
        Groups examples by conversation_id to prevent multi-turn dialogue leakage.
        """
        if not examples:
            return DatasetSplit(train=[], val=[], test=[])

        # Group examples: conversation_id groups or standalone item groups
        groups: Dict[str, List[TrainingExample]] = {}
        for idx, ex in enumerate(examples):
            group_key = ex.conversation_id if ex.conversation_id else f"_single_{ex.id}_{idx}"
            if group_key not in groups:
                groups[group_key] = []
            groups[group_key].append(ex)

        # Sort group keys for deterministic ordering before shuffle
        sorted_keys = sorted(groups.keys())

        # Deterministic shuffle using instance seed
        rng = random.Random(self.seed)
        rng.shuffle(sorted_keys)

        total_examples = len(examples)
        target_train = int(round(total_examples * self.train_ratio))
        target_val = int(round(total_examples * self.val_ratio))

        train_groups: List[str] = []
        val_groups: List[str] = []
        test_groups: List[str] = []

        current_train_count = 0
        current_val_count = 0

        for key in sorted_keys:
            group_items = groups[key]
            group_len = len(group_items)

            if current_train_count < target_train or (current_train_count == 0 and target_train > 0):
                train_groups.append(key)
                current_train_count += group_len
            elif (current_val_count < target_val) or (current_val_count == 0 and target_val > 0 and self.val_ratio > 0):
                val_groups.append(key)
                current_val_count += group_len
            else:
                test_groups.append(key)

        # Assemble split examples from group allocations
        train_examples: List[TrainingExample] = [ex for k in train_groups for ex in groups[k]]
        val_examples: List[TrainingExample] = [ex for k in val_groups for ex in groups[k]]
        test_examples: List[TrainingExample] = [ex for k in test_groups for ex in groups[k]]

        split_result = DatasetSplit(
            train=train_examples,
            val=val_examples,
            test=test_examples
        )

        # Run strict leakage verification
        self.verify_no_leakage(split_result)

        return split_result

    def verify_no_leakage(self, split: DatasetSplit) -> None:
        """
        Verify that no exact IDs, conversation groups, or normalized text contents
        cross split boundaries.
        """
        train_ids: Set[str] = {ex.id for ex in split.train}
        val_ids: Set[str] = {ex.id for ex in split.val}
        test_ids: Set[str] = {ex.id for ex in split.test}

        # 1. ID overlap check
        train_val_overlap = train_ids.intersection(val_ids)
        if train_val_overlap:
            raise DatasetSplitError(
                f"Data leakage detected: {len(train_val_overlap)} IDs exist in both train and val: {train_val_overlap}"
            )

        train_test_overlap = train_ids.intersection(test_ids)
        if train_test_overlap:
            raise DatasetSplitError(
                f"Data leakage detected: {len(train_test_overlap)} IDs exist in both train and test: {train_test_overlap}"
            )

        val_test_overlap = val_ids.intersection(test_ids)
        if val_test_overlap:
            raise DatasetSplitError(
                f"Data leakage detected: {len(val_test_overlap)} IDs exist in both val and test: {val_test_overlap}"
            )

        # 2. Conversation boundary check
        train_convs = {ex.conversation_id for ex in split.train if ex.conversation_id}
        val_convs = {ex.conversation_id for ex in split.val if ex.conversation_id}
        test_convs = {ex.conversation_id for ex in split.test if ex.conversation_id}

        conv_tv = train_convs.intersection(val_convs)
        if conv_tv:
            raise DatasetSplitError(
                f"Conversation turn leakage: conversation IDs {conv_tv} appear in both train and val splits."
            )

        conv_tt = train_convs.intersection(test_convs)
        if conv_tt:
            raise DatasetSplitError(
                f"Conversation turn leakage: conversation IDs {conv_tt} appear in both train and test splits."
            )

        conv_vt = val_convs.intersection(test_convs)
        if conv_vt:
            raise DatasetSplitError(
                f"Conversation turn leakage: conversation IDs {conv_vt} appear in both val and test splits."
            )

        # 3. Content near-duplicate / identical content check across splits
        def get_content_signatures(examples: List[TrainingExample]) -> Dict[str, str]:
            sig_map = {}
            for ex in examples:
                norm_instruction = normalize_text_for_dedup(ex.instruction)
                norm_input = normalize_text_for_dedup(str(sorted(ex.input.items())))
                sig = f"{ex.task.value}|{norm_instruction}|{norm_input}"
                sig_map[sig] = ex.id
            return sig_map

        train_sigs = get_content_signatures(split.train)
        val_sigs = get_content_signatures(split.val)
        test_sigs = get_content_signatures(split.test)

        tv_leakage = set(train_sigs.keys()).intersection(set(val_sigs.keys()))
        if tv_leakage:
            leaked_ids = [(train_sigs[sig], val_sigs[sig]) for sig in tv_leakage]
            raise DatasetSplitError(
                f"Near-duplicate content leakage between train and val: {leaked_ids}"
            )

        tt_leakage = set(train_sigs.keys()).intersection(set(test_sigs.keys()))
        if tt_leakage:
            leaked_ids = [(train_sigs[sig], test_sigs[sig]) for sig in tt_leakage]
            raise DatasetSplitError(
                f"Near-duplicate content leakage between train and test: {leaked_ids}"
            )
