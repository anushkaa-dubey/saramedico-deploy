import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function RetentionPage() {
  const filePath = path.join(process.cwd(), 'Legal', 'Data_Retention.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', padding: '80px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid rgba(0, 129, 254, 0.1)' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link href="/" style={{ color: '#0081FE', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' }}>
             &larr; Back to Home
          </Link>
        </div>
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content { color: #334155; line-height: 1.8; font-size: 16px; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #0f172a; margin-top: 2em; margin-bottom: 1em; font-weight: 700; letter-spacing: -0.02em; }
        .markdown-content h1 { font-size: 2.5rem; margin-top: 0; line-height: 1.2; }
        .markdown-content h2 { font-size: 1.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; }
        .markdown-content h3 { font-size: 1.25rem; }
        .markdown-content p { margin-bottom: 1.5em; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.5em; padding-left: 1.5em; }
        .markdown-content li { margin-bottom: 0.5em; }
        .markdown-content a { color: #0081FE; text-decoration: none; font-weight: 500; }
        .markdown-content a:hover { text-decoration: underline; }
        .markdown-content strong { color: #0f172a; font-weight: 600; }
        .markdown-content blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #64748b; font-style: italic; margin-left: 0; margin-right: 0; }
      `}} />
    </div>
  );
}
