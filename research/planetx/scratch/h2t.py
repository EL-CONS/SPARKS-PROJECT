import sys,re,html
t=sys.stdin.read()
t=re.sub(r'(?is)<(script|style|nav|header|footer).*?</\1>','',t)
t=re.sub(r'(?i)<br\s*/?>|</p>|</li>|</h\d>|</tr>|</div>','\n',t)
t=re.sub(r'(?i)<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>',r'\2 [\1]',t)
t=re.sub(r'<[^>]+>','',t); t=html.unescape(t)
t=re.sub(r'\n\s*\n+','\n',t); print(t)
