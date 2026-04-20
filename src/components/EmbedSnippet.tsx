/**
 * EmbedSnippet — a copy-pastable code snippet component for the admin panel.
 * Shows the embed code that third-party sites need to add the widget.
 */

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface EmbedSnippetProps {
  websiteUrl?: string;
  ownerId?: string;
  cdnBase?: string;
}

export function EmbedSnippet({
  websiteUrl = 'https://your-website.com',
  ownerId = 'your_owner_id',
  cdnBase = 'https://cdn.locly.app',
}: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- Locly Widget -->
<div id="locly-widget"></div>
<script>
  window.LOCLY_CONFIG = {
    websiteUrl: '${websiteUrl}',
    ownerId: '${ownerId}',
    position: 'center',
  };
</script>
<script src="${cdnBase}/widget.js" defer></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      // Fallback for Safari / insecure contexts
      const ta = document.createElement('textarea');
      ta.value = snippet;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-xl overflow-x-auto text-sm border border-white/10">
        <code>{snippet}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        title="Skopiuj kod"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-white/60" />
        )}
      </button>
    </div>
  );
}