"""
Dataset Formatting — AI-11.

Transforms validated training examples into deterministic JSONL format,
supporting standard instruction-response pairs and standard chat messages schema
compatible with Hugging Face and Gemma instruction tuning.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Union
from ai.fine_tuning.schemas import TrainingExample


class DatasetFormatter:
    """
    Formats training examples for instruction fine-tuning and writes/reads JSONL files.
    """

    @staticmethod
    def format_to_instruction_record(example: TrainingExample) -> Dict[str, Any]:
        """
        Format example as a clean instruction record without internal metadata leakage.
        """
        return {
            "id": example.id,
            "task": example.task.value,
            "instruction": example.instruction.strip(),
            "input": example.input,
            "output": example.output,
        }

    @staticmethod
    def format_to_chat_record(example: TrainingExample) -> Dict[str, Any]:
        """
        Format example as standard Hugging Face chat messages format
        (system, user, assistant), serializing structured objects to canonical JSON.
        """
        system_content = example.instruction.strip()
        user_content = json.dumps(example.input, sort_keys=True, ensure_ascii=False)
        assistant_content = json.dumps(example.output, sort_keys=True, ensure_ascii=False)

        return {
            "id": example.id,
            "task": example.task.value,
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": assistant_content},
            ]
        }

    @classmethod
    def write_jsonl(
        cls,
        examples: List[TrainingExample],
        output_path: Union[str, Path],
        as_chat_format: bool = False
    ) -> int:
        """
        Write formatted examples to a JSONL file. Returns count of lines written.
        """
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        count = 0
        with open(path, "w", encoding="utf-8") as f:
            for ex in examples:
                if as_chat_format:
                    record = cls.format_to_chat_record(ex)
                else:
                    record = cls.format_to_instruction_record(ex)

                line = json.dumps(record, sort_keys=True, ensure_ascii=False)
                f.write(line + "\n")
                count += 1

        return count

    @classmethod
    def read_jsonl(cls, input_path: Union[str, Path]) -> List[Dict[str, Any]]:
        """
        Read JSONL file and return parsed records.
        """
        path = Path(input_path)
        if not path.exists():
            raise FileNotFoundError(f"JSONL file not found: {input_path}")

        records: List[Dict[str, Any]] = []
        with open(path, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, start=1):
                clean_line = line.strip()
                if not clean_line:
                    continue
                try:
                    records.append(json.loads(clean_line))
                except json.JSONDecodeError as e:
                    raise ValueError(f"Malformed JSON at line {line_no} in {input_path}: {e}")

        return records
