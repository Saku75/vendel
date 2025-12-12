function baseLayout(content: string): string {
  return `<html>
  <body>
    ${content}

    <p>Venlig hilsen<br />
    <a href="{{baseUrl}}">Vendel.dk</a></p>
  </body>
</html>`;
}

export { baseLayout };
