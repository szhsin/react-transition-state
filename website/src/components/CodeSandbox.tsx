const CodeSandbox = ({ href }: { href: string }) => (
  <div className="code-sandbox">
    <a href={href} target="_blank" rel="noopener noreferrer">
      Edit on CodeSandbox ↗️
    </a>
  </div>
);

export { CodeSandbox };
