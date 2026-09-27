import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';

type Article = {
  title?: string;
  content?: string;
  source?: string;
  author?: string;
  image?: string;
  publishedDate?: string;
};

type ArticleReport = {
  headline?: string;
  summary?: string;
  highlights?: string[];
};

type SummaryResult = {
  topics?: string[];
  sentiment?: string;
  individual_reports?: Record<string, Record<string, ArticleReport>>;
};

function App() {
  const [url, setUrl] = useState('https://example.com');
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const firstLanguageReport = useMemo<ArticleReport | null>(() => {
    if (!summary?.individual_reports) return null;

    const firstArticle = Object.values(summary.individual_reports)[0];
    if (!firstArticle) return null;

    const englishReport = firstArticle['English'] as ArticleReport | undefined;
    if (englishReport) return englishReport;

    const alternativeReport = Object.values(firstArticle)[0] as ArticleReport | undefined;
    return alternativeReport ?? null;
  }, [summary]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const extractData = await extractResponse.json();
      if (!extractResponse.ok) {
        throw new Error(extractData.error || 'Unable to extract the article.');
      }

      setArticle(extractData);

      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [{
            title: extractData.title,
            content: extractData.content,
          }],
          targetLanguages: ['English', 'Telugu'],
        }),
      });

      const summarizeData = await summarizeResponse.json();
      if (!summarizeResponse.ok) {
        throw new Error(summarizeData.error || 'Unable to summarize the article.');
      }

      setSummary(summarizeData);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Something went wrong.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!article && !summary) return;

    const highlights = firstLanguageReport?.highlights ?? [];
    const content = [
      `Title: ${article?.title || 'News Article'}`,
      `Source: ${article?.source || 'Unknown'}`,
      `Author: ${article?.author || 'Unknown'}`,
      `Published: ${article?.publishedDate || 'Unknown'}`,
      '',
      'Summary:',
      firstLanguageReport?.summary || article?.content || 'No summary available.',
      '',
      'Highlights:',
      ...highlights.map((item: string) => `- ${item}`),
      '',
      'Article text:',
      article?.content || 'No content extracted.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const urlObject = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = `${(article?.title || 'news').replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(urlObject);
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">AI News Toolkit</p>
        <h1>Download the news</h1>
        <p className="subtitle">
          Paste a news URL, extract the article, generate a summary, and download it as a plain text file.
        </p>

        <form onSubmit={handleSubmit} className="news-form">
          <input
            type="url"
            value={url}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value)}
            placeholder="https://example.com/news/article"
            aria-label="News URL"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing…' : 'Extract & Summarize'}
          </button>
        </form>

        {error ? <div className="message error">{error}</div> : null}

        {article ? (
          <div className="result-card">
            <div className="meta-row">
              {article.image ? <img src={article.image} alt={article.title || 'Article'} /> : null}
              <div>
                <span className="badge">{article.source || 'Source'}</span>
                <h2>{article.title || 'Untitled article'}</h2>
                <p>
                  {article.author ? `By ${article.author}` : 'Author unavailable'}
                  {article.publishedDate ? ` • ${article.publishedDate}` : ''}
                </p>
              </div>
            </div>

            {summary ? (
              <div className="summary-block">
                <h3>Summary</h3>
                <p>{firstLanguageReport?.summary || article.content || 'No summary available.'}</p>

                {firstLanguageReport?.highlights && firstLanguageReport.highlights.length > 0 ? (
                  <ul>
                    {firstLanguageReport.highlights.map((point: string) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="actions">
              <button type="button" className="secondary" onClick={handleDownload}>
                Download News
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default App;
