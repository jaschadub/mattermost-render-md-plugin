// Mattermost webapp plugin: render .md attachments in the file preview modal.
// No build step. Runs against the React instance and PostUtils the webapp puts on window.
// biome-ignore lint/suspicious/noRedundantUseStrict: loaded as a classic <script>, not a module
'use strict';

(() => {
    // Matches the extensions the built-in code previewer treats as markdown, plus .markdown.
    const EXTENSIONS = ['md', 'markdown', 'mkd', 'mkdown'];

    // ponytail: hard cap, uploads come from other users. Stream or chunk if real notes exceed it.
    const MAX_BYTES = 1024 * 1024;

    const WRAPPER_STYLE = {
        width: '100%',
        maxWidth: 960,
        maxHeight: '100%',
        overflow: 'auto',
        padding: '16px 32px 32px',
        borderRadius: 8,
        background: 'var(--center-channel-bg)',
        color: 'var(--center-channel-color)',
    };

    function isMarkdown(fileInfo) {
        return EXTENSIONS.includes(String(fileInfo.extension || '').toLowerCase());
    }

    function fileUrl(id) {
        return `${window.basename || ''}/api/v4/files/${encodeURIComponent(id)}`;
    }

    // Wrap the file in a fence longer than any backtick run it contains, so the source view
    // goes through the same highlighter the built-in code previewer uses.
    function asCodeBlock(text) {
        const longest = (text.match(/`+/g) || []).reduce((n, run) => Math.max(n, run.length), 0);
        const fence = '`'.repeat(Math.max(3, longest + 1));
        return `${fence}markdown\n${text}\n${fence}`;
    }

    function MarkdownPreview({fileInfo}) {
        const React = window.React;
        const h = React.createElement;
        const [state, setState] = React.useState({text: null, error: null});
        const [showSource, setShowSource] = React.useState(false);

        React.useEffect(() => {
            setState({text: null, error: null});
            if (fileInfo.size > MAX_BYTES) {
                setState({text: null, error: 'File is too large to preview. Download it instead.'});
                return undefined;
            }
            let cancelled = false;
            fetch(fileUrl(fileInfo.id), {headers: {'X-Requested-With': 'XMLHttpRequest'}})
                .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`${res.status} ${res.statusText}`))))
                .then((text) => !cancelled && setState({text, error: null}))
                .catch((err) => !cancelled && setState({text: null, error: `Could not load file: ${err.message}`}));
            return () => {
                cancelled = true;
            };
        }, [fileInfo.id]);

        let body;
        if (state.error) {
            body = h('p', null, state.error);
        } else if (state.text === null) {
            body = h('p', null, 'Loading…');
        } else {
            const {formatText, messageHtmlToComponent} = window.PostUtils;
            body = messageHtmlToComponent(formatText(showSource ? asCodeBlock(state.text) : state.text));
        }

        const tab = (label, source) => h('button', {
            type: 'button',
            className: `btn btn-sm ${showSource === source ? 'btn-primary' : 'btn-tertiary'}`,
            'aria-pressed': showSource === source,
            onClick: () => setShowSource(source),
        }, label);

        return h('div', {className: 'render-md', style: WRAPPER_STYLE},
            h('div', {style: {display: 'flex', gap: 8, marginBottom: 16}}, tab('Rendered', false), tab('Source', true)),
            h('div', {className: 'post-message__text'}, body),
        );
    }

    if (typeof window !== 'undefined' && window.registerPlugin) {
        window.registerPlugin('render-md', {
            initialize(registry) {
                registry.registerFilePreviewComponent(isMarkdown, MarkdownPreview);
            },
        });
    }
    if (typeof module !== 'undefined') {
        module.exports = {isMarkdown, asCodeBlock, fileUrl}; // test.js only
    }
})();
