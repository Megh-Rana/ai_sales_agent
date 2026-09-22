/**
 * Resolves a reliable, reachable URL for source signals and company artifacts.
 * If the URL is a mock/placeholder/internal or unresolvable test link,
 * it returns a valid destination on the target platform (IndiaMART, LinkedIn, G2, etc.).
 */
export function getResolvableSourceUrl(
  rawUrl?: string,
  platform?: string,
  companyName?: string,
  companyDomain?: string,
  requirement?: string
): string {
  const url = (rawUrl || '').trim();
  const p = (platform || '').toLowerCase();
  const name = (companyName || '').trim();
  const q = (requirement || '').trim();

  const isMockOrUnreachable =
    !url ||
    url.includes('mock.') ||
    url.includes('.internal') ||
    url.includes('.example.') ||
    url.includes('example.com') ||
    url.includes('example.internal') ||
    (url.includes('linkedin.com/posts/') && (
      url.includes('rfp') ||
      url.includes('mock') ||
      url.includes('announcement') ||
      url.includes('crossdock') ||
      url.includes('expansion') ||
      url.includes('followup') ||
      url.includes('vitalis') ||
      url.includes('apex')
    )) ||
    (url.includes('linkedin.com/feed/update/') && url.includes('7182938472918237462'));

  if (!isMockOrUnreachable) {
    return url;
  }

  // 1. IndiaMART
  if (p.includes('indiamart')) {
    const searchTarget = name || q || 'Industrial Equipment';
    return `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(searchTarget)}`;
  }

  // 2. LinkedIn
  if (p.includes('linkedin')) {
    if (name) {
      return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
    }
    const searchTarget = q ? q.slice(0, 50) : 'Operations';
    return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(searchTarget)}`;
  }

  // 3. G2
  if (p.includes('g2')) {
    return `https://www.g2.com/search?utf8=%E2%9C%93&query=${encodeURIComponent(name || q || 'Voice AI')}`;
  }

  // 4. Twitter / X
  if (p.includes('twitter') || p.includes('x (')) {
    return `https://x.com/search?q=${encodeURIComponent(name || q || 'telecom')}`;
  }

  // 5. Crunchbase
  if (p.includes('crunchbase')) {
    return `https://www.crunchbase.com/textsearch?q=${encodeURIComponent(name || 'tech')}`;
  }

  // 6. Job / Recruitment
  if (p.includes('job') || p.includes('naukri')) {
    return `https://www.naukri.com/${encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-jobs`;
  }

  // 7. If company domain is valid real domain, visit company website
  if (companyDomain && !companyDomain.includes('internal') && !companyDomain.includes('example')) {
    return companyDomain.startsWith('http') ? companyDomain : `https://${companyDomain}`;
  }

  // 8. Default fallback: Google search for the company and requirement
  const searchTerms = [name, q.slice(0, 50)].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(searchTerms || 'commercial requirements')}`;
}
