# Lionel Messi ✦ M10 — site de fã (v2, luxo · azul · multi-páginas)

Site estático, sem build e sem dependências de servidor.

## Como abrir (importante)
1. **Mantenha a pasta inteira junto** — os HTML precisam de `assets/` (css, js, img, rive).
   Se abrir só o `index.html` sem a pasta, nada renderiza.
2. **Melhor experiência:** sirva por HTTP —
   `python3 -m http.server 8000` dentro desta pasta e abra `http://localhost:8000`.
   A transição de página roda no motor Rive completo (exige internet para o WASM
   em `file://`; por HTTP ela funciona offline).
3. **Abrir com duplo clique (`file://`) também funciona:** a intro tem fallback
   próprio — palavra M10 em degradê celeste, contador 00→100 e barra de progresso.
   Se a animação Rive não carregar (WebGL bloqueado, offline em `file://`), as
   cortinas assumem automaticamente. Nada de tela preta.
4. **A capa entra sozinha:** a intro é um preloader — conta 00→100 com uma barra
   fina e revela o site no fim (cerca de 2 s). Sem botão; clicar em qualquer
   lugar (ou Enter/Espaço) pula a contagem.
5. Navegadores suportados: Chrome/Edge/Firefox/Safari atuais (testado sem erros de JS).

## Publicar no GitHub Pages (passo a passo)
1. No GitHub: **Add file → Upload files**.
2. **Arraste O CONTEÚDO da pasta extraída** (os 5 `.html`, a pasta `assets/`, `.nojekyll`,
   este README) — não arraste o `.zip` (o GitHub não extrai) e não use "choose your files"
   selecionando arquivos de dentro das subpastas (isso achata a estrutura e quebra os caminhos).
3. Commit em `main`.
4. **Settings → Pages →** Branch: `main` / Folder: `/(root)` → Save.
5. Aguarde 1–2 min e abra `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
   Todos os caminhos são relativos — funciona em subpasta sem ajuste. `.nojekyll`
   desativa o processamento Jekyll (evita surpresas).

### Alternativa de 1 arquivo
`messi-m10-1arquivo.html` contém o site inteiro (5 páginas, CSS, JS e imagens embutidas,
~2,8 MB) com navegação por rotas `#/carreira`, `#/momentos`, `#/records`, `#/jogo`.
Envie **só esse arquivo** para o repositório e ative o Pages — funciona igual.
(A transição Rive completa fica disponível na versão de pasta; no arquivo único a
intro de cortinas em degradê assume automaticamente.)

## Páginas
- `index.html` — home: hero full-bleed com foto nova, marquee reativo ao scroll, statement,
  prévia de momentos, banda "2022" com parallax, números com contagem animada, linhas-índice.
- `carreira.html` — linha do tempo 1987→2025 com trilha de progresso ligada ao scroll.
- `momentos.html` — galeria de 12 quadros com lightbox (setas ←/→ no teclado, contador 1/12).
- `records.html` — números com contagem, as 8 Bolas de Ouro (moedas de ouro) e acordeão.
- `jogo.html` — embaixadinhas com recorde salvo no navegador (localStorage).

## Sistema de design (DNA landonorris.com)
- Paleta: azul-noite `#07090F`, off-white `#F2F4F8`, celeste argentino `#75AADB`,
  ouro champagne `#C9A24B` (Bolas de Ouro). Tema claro champagne em `#F2F1EA`.
- Tipografia: Mona Sans variável (display, caps, wt 660/wdth 93) + Playfair Display itálico
  como acento de luxo.
- Grain de filme, hairlines, raio .54/.74rem, easing `cubic-bezier(.65,.05,0,1)`.

## Transição de página — cada destino tem a sua (mecânica do Lando + variantes M10)
`assets/rive/page-transition.riv` (artboard/state machine `page-transition`, inputs
`initial` / `transition-out` / `transition-in`) rodando no runtime Rive self-hosted
(`assets/rive/`). Cliques internos tocam `transition-out`, aguardam 1000 ms (o `lL` do
Lando), navegam e a página nova toca `transition-in` — e a marca central anuncia o
destino (M10 → carreira…). Na primeira visita, preloader automático com contador
(equivalente ao "Load Norris").

**Nada de transição igual para tudo — cada destino tem a SUA mecânica:**
- **v1 · varredura dupla** (→ carreira) — duas ondas cheias varrem da esquerda
  em cascata, com fio celeste na frente; o monograma abre por uma fenda;
- **v2 · flash de câmera** (→ momentos) — obturador fecha rápido e um clarão
  dourado estoura no fechamento; o monograma estaca nítido vindo do desfoque;
- **v3 · scan de placar** (→ números) — uma linha-celeste varre a tela e vai
  preenchendo um painel com grade de placar; o monograma desce como linha;
- **v4 · íris-bola** (→ jogo) — a página some dentro de um círculo celeste com
  aro dourado que cresce do centro (clip-path); o monograma cresce de dentro;
- **v5 · cortina de palco** (→ início) — dois panos com pregas caem com franja
  dourada e facho de refletor; o monograma desce com o pano.
Cada variante carrega ainda o **numeral-fantasma** do destino (02–05/01 vazado,
enviesado) e tinge a arte do Rive à sua maneira. A variante é escolhida pelo
destino antes da saída e reaplicada na chegada (sessionStorage), inclusive antes
do primeiro paint. Sem Rive (ex.: `file://`), as cortinas assumem com as mesmas
geometrias, cores e tempos.

**A marca central é um monograma próprio:** micro-caps "LIONEL MESSI" entre
fios de luz, **M** em degradê gelo (branco→celeste) e **10** em Playfair itálico
com degradê champagne que respira na intro (varredura de brilho). O mesmo
tratamento vive no header (M10 celeste) e na assinatura grande do fim (M10 ouro).

## Transições de scroll (Lenis + engine própria)
Rolagem suave Lenis (`assets/js/lenis.min.js`, MIT) + `assets/js/site.js`:
split-text por caractere nos títulos, reveals com blur/slide, parallax, hero com zoom
no scroll, marquee com velocidade/direção reativas, header que se esconde, barra de
progresso lateral, trilha da timeline, contadores e acordeão, pré-carregamento das
páginas internas no hover (troca ainda mais rápida) e suporte a voltar/avançar do
navegador (bfcache). Respeita `prefers-reduced-motion`.

**Rolar para o próximo tópico:** ao chegar no fim e continuar rolando
(rodinha com gesto firme ou arrastar para cima no celular), a transição de página
dispara sozinha para o próximo tópico — na ordem
início → carreira → momentos → números → jogo → início.

**O fim de cada página é só a deixa — minimalista e sem categorias:** um bloco
alto com um ponto celeste pulsante, "role para continuar" e a seta ↓ animada.
Nada de nomes de página nem números no caminho. O índice do site existe apenas
na última página (jogo): linhas finas 01 Início · 02 Carreira · 03 Momentos ·
04 Números com seta, acima da assinatura MESSI ✦ M10 (M10 em ouro) e dos
créditos completos. No arquivo único cada rota carrega a própria deixa.

## Créditos
Projeto de fã, não oficial. Fotos de imprensa via busca pública (ESPN, Fox Sports,
Gulf News, The New Yorker e outras), uso editorial sem fins comerciais. Direção de arte
inspirada no site de Lando Norris (OFF+BRAND); implementação própria. Lenis (MIT).
