const {
  useState,
  useEffect
} = React;
const pegarUsername = async () => {
  try {
    let resposta = await fetch("/forum");
    if (!resposta.ok) return null;
    let html = await resposta.text();
    let regex = /_userdata\["username"\]\s*=\s*"([^"]+)"/;
    let match = html.match(regex);
    if (match && match[1]) return match[1];
  } catch (err) {
    console.error('Erro ao pegar username:', err);
  }
  return null;
};
const parseBBCode = input => {
  let html = input;
  html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\]\s*\[tr\]/g, '][tr]');
  html = html.replace(/\]\s*\[td\]/g, '][td]');
  html = html.replace(/\[\/td\]\s*\[/g, '[/td][');
  html = html.replace(/\[\/tr\]\s*\[/g, '[/tr][');
  html = html.replace(/\[table(?: style="([^"]*)")?(?: bgcolor="([^"]*)")?\]/gi, (match, style, bgcolor) => {
    let styleStr = style || '';
    if (bgcolor) styleStr += ` background-color: ${bgcolor};`;
    if (!styleStr.includes('color')) styleStr += ' color: #e4e4e7;';
    if (!styleStr.includes('border') && !styleStr.includes('none')) styleStr += ' border: 1px dashed #52525b;';
    if (!styleStr.includes('width')) styleStr += ' width: 100%;';
    return `<div class="bb-table" style="display: table; border-collapse: collapse; ${styleStr}">`;
  });
  html = html.replace(/\[\/table\]/gi, '</div>');
  html = html.replace(/\[tr(?: style="([^"]*)")?(?: bgcolor="([^"]*)")?\]/gi, (match, style, bgcolor) => {
    let styleStr = style || '';
    if (bgcolor) styleStr += ` background-color: ${bgcolor};`;
    return `<div class="bb-tr" style="display: table-row; ${styleStr}">`;
  });
  html = html.replace(/\[\/tr\]/gi, '</div>');
  html = html.replace(/\[td(?:\s+colspan="(\d+)")?(?: style="([^"]*)")?(?: bgcolor="([^"]*)")?\]/gi, (match, colspan, style, bgcolor) => {
    let styleStr = style || '';
    if (bgcolor) styleStr += ` background-color: ${bgcolor};`;
    if (!styleStr.includes('padding')) styleStr += ' padding: 8px;';
    return `<div class="bb-td" style="display: table-cell; vertical-align: top; ${styleStr}">`;
  });
  html = html.replace(/\[\/td\]/gi, '</div>');
  html = html.replace(/\[div(?: style="([^"]*)")?\]/gi, (match, style) => {
    let styleStr = style || '';
    return `<div style="${styleStr}">`;
  });
  html = html.replace(/\[\/div\]/gi, '</div>');
  html = html.replace(/\[h2\](.*?)\[\/h2\]/gis, '<h2 class="text-xl font-bold my-2 border-b border-gray-700 pb-1">$1</h2>');
  html = html.replace(/\[h3\](.*?)\[\/h3\]/gis, '<h3 class="text-lg font-bold my-2 text-gray-300">$1</h3>');
  html = html.replace(/\[b\](.*?)\[\/b\]/gis, '<b>$1</b>');
  html = html.replace(/\[i\](.*?)\[\/i\]/gis, '<i>$1</i>');
  html = html.replace(/\[u\](.*?)\[\/u\]/gis, '<u>$1</u>');
  html = html.replace(/\[strike\](.*?)\[\/strike\]/gis, '<s>$1</s>');
  html = html.replace(/\[center\](.*?)\[\/center\]/gis, '<div style="text-align: center;">$1</div>');
  html = html.replace(/\[left\](.*?)\[\/left\]/gis, '<div style="text-align: left;">$1</div>');
  html = html.replace(/\[right\](.*?)\[\/right\]/gis, '<div style="text-align: right;">$1</div>');
  html = html.replace(/\[justify\](.*?)\[\/justify\]/gis, '<div style="text-align: justify;">$1</div>');
  html = html.replace(/\[quote(?:="(.*?)")?\](.*?)\[\/quote\]/gis, (match, author, content) => {
    return `<div class="bb-quote border-l-4 border-violet-500 bg-[#1e1e24] p-3 my-2 text-sm italic"><div class="font-bold text-xs text-violet-300 mb-1">${author ? author + ' disse:' : 'Citação:'}</div>${content}</div>`;
  });
  html = html.replace(/\[code\](.*?)\[\/code\]/gis, '<pre class="bg-black p-2 font-mono text-sm text-green-400 overflow-x-auto my-2 rounded border border-gray-800">$1</pre>');
  html = html.replace(/\[spoiler(?:="(.*?)")?\](.*?)\[\/spoiler\]/gis, (match, title, content) => {
    return `<details class="bg-[#27272a] p-2 my-2 rounded cursor-pointer border border-[#3f3f46]"><summary class="font-bold text-violet-300 text-sm hover:text-white transition-colors">${title || 'Spoiler'}</summary><div class="mt-2 p-2 bg-black/50 rounded">${content}</div></details>`;
  });
  html = html.replace(/\[hide\](.*?)\[\/hide\]/gis, '<div class="bg-red-900/20 border border-red-500/30 p-2 my-2 text-red-300 text-sm font-mono">[HIDE] Requires Reply</div>');
  html = html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width: 100%; height: auto; border-radius: 4px;" />');
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" class="text-blue-400 hover:text-blue-300 underline">$2</a>');
  html = html.replace(/\[color=(.*?)\](.*?)\[\/color\]/gis, '<span style="color: $1;">$2</span>');
  html = html.replace(/\[size=(.*?)\](.*?)\[\/size\]/gis, '<span style="font-size: $1px;">$2</span>');
  html = html.replace(/\[font=(.*?)\](.*?)\[\/font\]/gis, '<span style="font-family: $1;">$2</span>');
  html = html.replace(/\[list\]/gi, '<ul class="list-disc list-inside my-2">');
  html = html.replace(/\[\/list\]/gi, '</ul>');
  html = html.replace(/\[\*\]/gi, '<li>');
  html = html.replace(/\[!--(.*?)--\]/g, '');
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/<div class="bb-tr"(.*?)><br \/>/g, '<div class="bb-tr"$1>');
  html = html.replace(/<\/div><br \/>/g, '</div>');
  html = html.replace(/<div class=""(.*?)><br \/>/g, '<div class=""$1>');
  return html;
};
const FILE_TREE = [{
  id: 'folder-basics',
  name: '1. Fundamentos',
  type: 'folder',
  isOpen: true,
  children: [{
    id: 'f-intro',
    name: '01_Introdução.txt',
    type: 'file',
    lessonId: 'intro'
  }, {
    id: 'f-context',
    name: '02_O_Terreno.md',
    type: 'file',
    lessonId: 'forum-context'
  }, {
    id: 'f-tools',
    name: '03_O_Alicerce.bb',
    type: 'file',
    lessonId: 'basic-concepts'
  }]
}, {
  id: 'folder-structure',
  name: '2_Arquitetura_Tables',
  type: 'folder',
  isOpen: true,
  children: [{
    id: 'f-struct-basic',
    name: '04_A_Fundação.bb',
    type: 'file',
    lessonId: 'structure-basic'
  }, {
    id: 'f-struct-adv',
    name: '05_Arquitetura_Avançada.bb',
    type: 'file',
    lessonId: 'structure-advanced'
  }]
}, {
  id: 'folder-styling',
  name: '3. Design e CSS',
  type: 'folder',
  isOpen: true,
  children: [{
    id: 'f-style-intro',
    name: '06_Estilização_CSS.css',
    type: 'file',
    lessonId: 'style-intro'
  }, {
    id: 'f-style-adv',
    name: '07_Acabamento_de_Elite.css',
    type: 'file',
    lessonId: 'css-arsenal'
  }, {
    id: 'f-layout-geo',
    name: '08_Geometria_do_Layout.css',
    type: 'file',
    lessonId: 'layout-mastery'
  }, {
    id: 'f-color',
    name: '09_Psicologia_das_Cores.txt',
    type: 'file',
    lessonId: 'color-theory'
  }]
}];
const LESSONS = {
  'intro': {
    id: 'intro',
    title: '1_Introdução',
    category: 'básico',
    content: `
# 01. Introdução

Desenvolvido por <b>.Brendon</b>!

Seja muito bem-vindo(a)!

Primeiramente, antes de qualquer coisa, quero que você saiba: entendo o que você sente e sei por que está lendo esta apostila. Você observa aqueles BBCodes impressionantes nos subfóruns, cheios de vida, movimento e detalhes, e talvez pense: **“Eu nunca vou conseguir fazer isso, não sou um ‘Programador/BBCodeiro’.”**

Por isso, o primeiro passo é: abandone essa ideia de que não é capaz. Escrever código não é um dom misterioso, muito menos um privilégio de gênios da matemática. Trata-se de uma forma de expressão, como escrever um texto, compor uma música ou desenhar. Se você tem ideias e desejo de comunicá‑las, já possui o elemento mais importante.

Lembro bem que recentemente me ofereci a reformular visualmente os BBCodes de uma companhia. Mas, naquele momento, minha principal preocupação não era a quantidade de recursos ou BBCodes que usaria, e sim preservar a identidade da CIA, criando algo inédito em relação ao que eu já havia produzido, sem perder meu traço.

Para isso, recorri a uma ferramenta excelente de design, o Figma. Desenhei tudo manualmente, escolhendo paleta de cores, formatos, tipografias, elementos gráficos e a disposição de cada parte na tela, pensando tanto em quem acessa pelo computador quanto pelo celular. Depois, converti aquele layout em linhas de código, até reproduzir a imagem em BBCode, porque eu tinha convicção de que seria capaz de fazê‑lo.

[EXAMPLE title="Esboço no Figma" img="https://i.imgur.com/syooY3i.png"]
Aqui eu desenhei exatamente onde queria cada elemento. Perceba como o layout é limpo antes mesmo de tocar no código.
[/EXAMPLE]

[EXAMPLE title="Resultado em BBCode" img="https://i.imgur.com/QWHEc5f.png"]
E aqui o resultado final renderizado no fórum. A fidelidade visual é alta porque houve planejamento.
[/EXAMPLE]

# A missão do curso com você
Eu não quero que você seja alguém que apenas copia e cola códigos sem entender o que está fazendo. Genuinamente, eu quero que tenha **liberdade**.
*   Quero que, ao se deparar com um código quebrado, em vez de sentir pânico, você tenha a curiosidade de um mecânico que sabe onde procurar o problema e qual “parafuso” apertar.
*   Que você compreenda o **porquê** das coisas, e não só o como.

Ao longo deste curso, estarei ao seu lado como mentor. Vamos tirar o mistério de cada colchete, cada ponto e vírgula, até que tudo faça sentido. Vamos enxergar o BBCode como tijolos e o CSS como a tinta que dá cor e acabamento à construção.

A jornada do noob ao pro começa agora. Respire fundo!!! Vamos "BBCodar"?
          `,
    activity: {
      question: "Qual é o principal objetivo deste curso segundo o mentor?",
      options: ["Decorar todos os códigos existentes no mundo.", "Aprender a copiar o BBCode de outros usuários.", "Ganhar liberdade criativa entendendo a lógica por trás da estrutura (tijolos) e do estilo (tinta).", "Aprender a hackear o fórum."],
      correctIndex: 2,
      explanation: "O objetivo não é a repetição mecânica, mas o entendimento profundo que permite a você criar seus próprios BBCodes e com sua identidade."
    }
  },
  'forum-context': {
    id: 'forum-context',
    title: '2_O_Terreno',
    category: 'básico',
    content: `
# 02. Conhecendo o Terreno: O Perigo Invisível

Imagine que você desenhou a planta da casa dos seus sonhos: tudo medido, equilibrado, no lugar certo. Porém, quando entrega o projeto ao construtor, ele resolve, por conta própria, acrescentar um metro de cimento entre cada tijolo. O resultado? A casa fica esticada, torta, completamente diferente daquilo que você planejou.

É exatamente isso que o sistema de Mensagens Privadas (MPs) e tópicos do Forumeiros faz com o seu código.

## O Vilão: a interpretação literal dos códigos
Quando você publica em um tópico, o fórum também interfere nas quebras de linha e nos espaços, o que pode distorcer o layout se o código não estiver bem ajustado. A diferença é que, nas MPs, além desse comportamento, você costuma ter mais liberdade para usar recursos de CSS, enquanto os tópicos são mais limitados nesse aspecto.

Em outras palavras: tanto tópicos quanto MPs podem “bagunçar” seu código se você não tomar cuidado com espaços e linhas em branco, mas as MPs permitem construções visuais mais avançadas justamente por aceitarem um uso mais amplo de CSS.

Toda vez que você aperta a tecla ENTER para pular uma linha, o fórum entende isso como um espaço real na versão final da postagem.
Se você deixou sua tabela “bonita” no editor usando 20 quebras de linha para se organizar, na postagem ela vai aparecer com um enorme bloco em branco antes de começar.

Prefira sempre usar a opção de pré-visualização antes de considerar um código finalizado e, antes disso, copie e cole o conteúdo em um local seguro para evitar qualquer perda.

### ❌ O Código "humanizado" (falha na MP)
\`\`\`[table]
  [tr]
    [td]
       Olá!
    [/td]
  [/tr]
[/table]\`\`\`

Ela desenha 5 linhas vazias antes de mostrar o "Olá!".

### ✅ A técnica de compressão (Minificação)
Para contornar esse comportamento do fórum, precisamos entregar o código de forma “compactada”: sem espaços desnecessários e sem quebras de linha entre as tags principais. Fica desagradável de ler, mas é exatamente o formato que a fórum interpreta da melhor maneira.

\`\`\`[table][tr][td]Olá![/td][/tr][/table]\`\`\`

**Dica de Ouro:** nunca edite diretamente um código compactado; encontrar erros desse jeito é quase impossível. Mantenha sempre duas versões no seu bloco de notas: a versão de trabalho (organizada, com espaços, fácil de ler) e a versão de envio (gerada apenas na hora de mandar o BBCode, a partir da compactação da versão de trabalho).
          `,
    activity: {
      question: "Qual é o fluxo de trabalho seguro para criar fichas para MP?",
      options: ["Escrever tudo direto na caixa de mensagem do fórum.", "Criar organizado, enviar organizado e torcer para dar certo.", "Manter uma versão organizada para editar, e criar uma versão compactada (minificada) apenas no momento do envio.", "Nunca usar tabelas em BBCodes."],
      correctIndex: 2,
      explanation: "Manter a versão legível (fonte) salva permite que você faça correções futuras sem ter que decifrar o código compactado."
    }
  },
  'basic-concepts': {
    id: 'basic-concepts',
    title: '3_O_Alicerce',
    category: 'básico',
    content: `
# 03. O Alicerce: Ferramentas e Acessibilidade

Antes de conhecer as ferramentas, você precisa dominar a lógica de construção. Muitos iniciantes erram porque apenas copiam códigos, sem compreender como cada parte se comporta e se encaixa no todo.

## 1. A regra de ouro: abrir e fechar tags
Imagine que as tags de BBCode funcionam como **caixas**.
Quando você coloca um texto dentro de uma delas, precisa lembrar de fechá-la corretamente antes de “guardar”, ou seja, antes de finalizar o código.

*   Abertura: \`[tag]\`
*   Fechamento: \`[/tag]\` (Sempre tem uma barra).

### O aninhamento (Regra do Cebolão)
Quando usamos várias tags juntas, seguimos a regra: **o primeiro a entrar é o último a sair**.
Imagine que você está se vestindo:
1. Primeiro coloca a **meia** \`[meia]\`.
2. Depois calça o **sapato** \`[sapato]\`.

Para tirar (fechar):
1. Primeira tira o **sapato** \`[/sapato]\`.
2. Por fim, tira a **meia** \`[/meia]\`.

### ❌ Forma errada: 
\`[b][i]Texto[/b][/i]\`
O fórum não consegue encerrar o negrito enquanto o itálico ainda está aberto dentro dele.

### ✅ Correto (Aninhado):
\`[b][i]Texto[/i][/b]\`

---

## 2. Estilização de Texto
Vamos ver cada ferramenta do seu cinto de utilidades.

### Negrito
Deixa a fonte mais espessa. Use para destacar palavras-chave.
*   **Tag:** \`[b][/b]\`
*   **Certo:** \`[b]Aviso Importante[/b]\`
*   **Errado:** \`[b]Texto\` (Esquecer de fechar deixa o resto do post inteiro em negrito).

### Itálico
Inclina o texto. Use para pensamentos, sussurros ou termos estrangeiros.
*   **Tag:** \`[i][/i]\`
*   **Exemplo:** \`[i]Sussurrou ele...[/i]\`

### Sublinhado
Cria uma linha sob o texto, normalmente usado para dar ênfase em trechos. Evite usar muito, pois confunde com links.
*   **Tag:** \`[u][/u]\`
*   **Exemplo:** \`[u]Edição em PL[/u]\`

### Riscado
Passa um traço no meio. Ótimo para correções, ironias ou itens concluídos.
*   **Tag:** \`[strike][/strike]\`
*   **Certo:** \` §1º - [strike]200 medalhas efetivas negativas[/strike] 100 medalhas efetivas negativas.\`
*   **Errado:** \`[strike]Texto\` (Sem fechar).

### Alinhar à Esquerda
Alinha o texto à margem esquerda.
*   **Tag:** \`[left]Texto[/left]\`
*   **Exemplo:** \`[left]1. Introdução[/left]\`

### Centralizar
O padrão do fórum. Alinha o texto no centro, normalmente fundamental para estética de títulos e imagens.
*   **Tag:** \`[center][/center]\`
*   **Exemplo:** \`[center]Título[/center]\`

### Alinhar à Direita
Alinha à margem direita. Normalmente, usado para datas, assinaturas ou créditos no fim do post.
*   **Tag:** \`[right][/right]\`
*   **Exemplo:** \`[right]Material elaborado por...[/right]\`

### Justificar
Alinha o texto em ambas as margens, criando blocos quadrados e organizados. Usar em parágrafos longos (desenvolvimento de uma sindicância, introdução de relatório).
*   **Tag:** \`[justify][/justify]\`
*   **Exemplo:** \`[justify]Insira aqui seu texto corrido sobre o tópico.[/justify]\`

### Cabeçalho 2 (H2)
Título de seção principal, para usar no meio de uma frase.
*   **Tag:** \`[h2][/h2]\`
*   **Certo:** \`[h2]História[/h2]\`
*   **Errado:** Usar no meio de uma frase.

### Cabeçalho 3 (H3)
Subtítulo. Menor que o H2.
*   **Tag:** \`[h3][/h3]\`
*   **Exemplo:** \`[h3]Militarismo[/h3]\`

### Cabeçalho 4 (H4)
Sub-subtítulo.
*   **Tag:** \`[h4][/h4]\`
*   **Exemplo:** \`[h4]Características[/h4]\`

### Tamanho da Fonte
Define o tamanho em pixels.
*   **Tag:** \`[size=10][/size]\`
*   **Certo:** \`[size=18]Destaque[/size]\` ou \`[size=10]Nota de rodapé[/size]\`
*   **Errado:** \`[size=50]Gigante[/size]\` (Quebra layout em celulares).

### Fonte (Tipografia)
Define a família da letra.
*   **Tag:** \`[font=Arial][/font]\`
*   **Certo:** \`[font=Georgia]Texto corrido[/font]\`
*   **Errado:** \`[font=FonteQueSoEuTenho]\` (Se o fórum não tiver a fonte "instalada", ninguém verá).

### Cor
Define a cor do texto (use hexadecimal).
*   **Tag:** \`[color=#4d7684][/color]\`
*   **Certo:** \`[color=#FF0000]Alerta[/color]\` ou \`[color=red]Alerta[/color]\`
*   **Errado:** \`[color=vermelho escuro]\` (O código prefere inglês ou hexadecimal).

### Subscrito
Texto exibido em tamanho reduzido abaixo da linha base, normalmente usado em fórmulas, notas e índices numéricos, como em referências do tipo x₂.
*   **Tag:** \`[sub][/sub]\`
*   **Exemplo:** \`H[sub]2[/sub]O\` (Fórmulas químicas).

### Sobrescrito
Texto exibido em tamanho reduzido acima da linha base, muito usado para expoentes, notas e referências, como em x² ou em chamadas numéricas em textos.
*   **Tag:** \`[sup][/sup]\`
*   **Certo:** \`E=mc[sup]2[/sup]\` (Fórmulas matemáticas ou referências).

---

## 3. Estrutura e Recursos Especiais

### Lista com Marcadores
Cria uma lista com bolinhas (bullets).
*   **Tag:** \`[list][*]Item[/list]\`
### ✅ Forma correta:
    \`\`\`
    [list]
    [*]Espada
    [*]Escudo
    [/list]\`\`\`

### ❌ Forma errada:
Esquecer o \`[*]\` antes de cada item (o item some ou desformata).

### Lista Numerada
Cria uma lista ordenada (1, 2, 3...).
*   **Tag:** \`[list=1][*]Item[/list]\`
### ✅ Forma correta:
\`\`\`
[list=1][*]Primeiro
 [*]Segundo[/list]
 \`\`\`

### ❌ Forma errada:
\`\`\`[list][*]Primeiro 
Segundo[/list]\`\`\`

### Linha Horizontal
Cria uma linha divisória para separar seções.
*   **Tag:** \`[hr]\`
*   **Certo:** \`Texto [hr] Texto\`
*   **Errado:** \`[hr][/hr]\` (Esta tag é **única**, ela não tem fechamento).

### Spoiler
Serve para ocultar informações, exibindo o conteúdo apenas quando o leitor decide clicar para revelar.
*   **Tag:** \`[spoiler=""][/spoiler]\`
*   **Certo:** \`[spoiler="Título"]Texto[/spoiler]\`
*   **Errado:** \`[spoiler=Título]Texto[/spoiler]\` (Sem as aspas no título).

### Citação
Destaca uma fala ou referência a outro post.
*   **Tag:** \`[quote="Autor"][/quote]\`
*   **Certo:** \`[quote="Código de Conduta Militar"]Art. 1º -...[/quote]\`
*   **Errado:** \`[quote]Texto\` (Sem fechar).

### Código
Exibe o texto "cru", sem interpretar as tags. Essencial para tutoriais.
*   **Tag:** \`[code][/code]\`
*   **Exemplo:** \`[code][b]Negrito[/b][/code]\`

### Conteúdo Oculto (Hide)
Esconde o conteúdo até o usuário responder ao tópico.
*   **Tag:** \`[hide][/hide]\`
*   **Exemplo:** \`[hide]https://www.policiarcc.com/privmsg[/hide]\`

### Tabela
A estrutura mestra de layout (linhas e colunas).
*   **Tag:** \`[table][tr][td]Conteúdo[/td][/tr][/table]\`
*   **Certo:** Sempre seguir a ordem [table] > [tr] > [td].
*   **Errado:** \`[table][td]Texto[/td][/table]\` (Esquecer o \`[tr]\` quebra a tabela).

### Imagem
Exibe uma imagem da internet.
*   **Tag:** \`[img][/img]\`
*   **Certo:** \`[img]https://imgur.com/foto.png[/img]\`
*   **Errado:** \`[img]https://imgur.com/foto[/img]\` (O link sempre deve ter .png, .jpeg, .jpg ou .gif no final).

### Link (URL)
Cria um hiperlink clicável com texto personalizado.
*   **Tag:** \`[url=Link]Título[/url]\`
*   **Certo:** \`[url=https://google.com]Google[/url]\`
*   **Errado:** \`[url]google.com[/url]\` (Funciona, mas visualmente polui se o link for grande).

### Vídeo (YouTube)
Incorpora um vídeo. Geralmente usa-se apenas o ID do vídeo.
*   **Tag:** \`[youtube]ID[/youtube]\`
*   **Exemplo:** \`[youtube]2SUwOgmvzK4[/youtube]\` (O ID é a parte final do link do vídeo).

### Rolagem (Scroll)
Texto que se move horizontalmente (marquee).
*   **Tag:** \`[scroll]Texto[/scroll]\`

### Sobe e Desce (Updown)
Texto que se move verticalmente.
*   **Tag:** \`[updown]Texto[/updown]\`

### Aleatório (Rand)
Gera um número aleatório (requer sistema de dados no fórum).
*   **Tag:** \`[rand]Min,Max[/rand]\` ou \`[rand]Conteúdo[/rand]\`
*   **Exemplo:** \`[rand]1,20[/rand]\` (Gera um número entre 1 e 20).
          `,
    activity: {
      question: "Qual a forma correta de fechar as tags [b][color=#FFF][i]Texto...",
      options: ["...[/i][/color][/b]", "...[/b][/color][/i]", "...[/color][/i][/b]", "A ordem não importa."],
      correctIndex: 0,
      explanation: "A última tag que abriu ([i]) fecha primeiro. A penúltima ([color]) fecha em segundo. A primeira ([b]) fecha por último."
    }
  },
  'structure-basic': {
    id: 'structure-basic',
    title: '4_A_Fundação_Tables',
    category: 'intermediário',
    content: `
# 04. Engenharia: A Fundação do Prédio

Vamos voltar à metáfora da construção. Se o BBCode é o tijolo, a tabela \`[table]\` é a estrutura de concreto armado que sustenta tudo. Sem essa base, o resto do layout perde a forma e desmorona.

Por isso, eu preciso que você visualize o espaço: pense na tabela como o esqueleto da construção, organizando onde cada bloco de conteúdo ficará antes mesmo de você considerar cores, ícones ou efeitos.

---

## A Hierarquia Sagrada
Imagine um **prédio cheio de apartamentos**.

1.  **\`[table]\` (O Prédio)**
    É a estrutura externa: nada existe fora dela, e é ela quem define os limites da propriedade.

2.  **\`[tr]\` (O Andar - Table Row)**
    Prédios são divididos em andares horizontais. O \`[tr]\` representa exatamente isso: cada linha, como se fosse um andar dessa construção.
*   Quer construir no térreo? Abra uma \`[tr]\`.
*   Quer construir no 1º andar? Feche a \`[/tr]\` anterior e abra uma nova.
*   **Regra:** Nunca coloque móveis (texto) soltos no corredor do andar. O andar serve apenas para segurar os apartamentos \`[td]\`.

3.  **\`[td]\` (O Apartamento - Table Data)**
É a célula: o espaço realmente habitável.
*   É aqui — e **SOMENTE AQUI** — que você deve colocar seus textos, imagens e links.

\`\`\`[table][tr][td]Escreva o texto corrido aqui.[/td][/tr][/table]\`\`\`

---

## O Diagrama do Sucesso
Visualize esta estrutura sempre que estiver codando:

\`\`\`
[table] ----------------------- (Início do Prédio)
   |
   [tr] ----------------------- (1º Andar)
    |     
    |   [td] ------------------ (Apartamento 101)
    |     |  
    |     |   SEU CONTEÚDO AQUI
    |     |
    |   [/td] ----------------- (Fim do Ap. 101)
    |
   [/tr] ---------------------- (Fim do 1º Andar)
   |
[/table] ---------------------- (Fim do Prédio)
\`\`\`

Se você quebrar essa ordem (colocar \`td\` fora de \`tr\`, ou texto fora de \`td\`), o fórum vai tentar “consertar” o erro e, quase sempre, o resultado é desastroso: textos somem, o layout se deforma e tudo foge do que você planejou.
          `,
    activity: {
      question: "Se você colocar um texto solto entre [/td] e [/tr], onde ele vai aparecer?",
      options: ["Vai aparecer normalmente.", "O fórum pode jogar o texto para fora da tabela ou fazê-lo desaparecer, pois é um local inválido.", "Vai criar uma nova célula automaticamente.", "Vai ficar em negrito."],
      correctIndex: 1,
      explanation: "O espaço entre o fechamento de uma célula e o fechamento da linha é vazio estrutural. Nada deve existir ali."
    }
  },
  'structure-advanced': {
    id: 'structure-advanced',
    title: '5_Arquitetura_Avançada',
    category: 'intermediário',
    content: `
# 05. Arquitetura Avançada: O Poder do Aninhamento

Você já sabe erguer um prédio simples. Agora, vamos construir anexos do apartamento.
Queremos layouts mais elaborados: uma imagem à esquerda, nickname à direita e, abaixo de tudo isso, um espaço para a patente.

Para alcançar esse tipo de estrutura, usamos o conceito de **tabelas aninhadas** (nested tables).
Pense nelas como “bonecas russas”: uma tabela dentro da outra, cada uma organizando uma parte específica do layout.

---

## O Conceito "Inception"
Imagine que você tem um quarto grande (uma \`[td]\`).
Dentro desse espaço, você quer organizar seus livros em prateleiras bem alinhadas. Você não espalha tudo pelo chão, mas sim coloca uma estante.

No BBCode, essa “estante” é uma nova tabela construída dentro da célula da tabela principal. É ela que permite dividir melhor o espaço e posicionar cada elemento exatamente onde você quer.

# O Layout Clássico
*   **Table:** segura tudo.
*   **Linha 1:** duas colunas.
*   **Coluna Esquerda:** a imagem do personagem.
*   **Coluna Direita:** uma **table secundária** com os status (Nickname e Patente).

\`\`\`
[table][tr][td][img]https://i.imgur.com/XIZJOh7.png[/img][/td] 
[td][table][tr]
       [td] Nickname: .Brendon [/td][/tr]
       [tr][td] Patente: Aspirante a Oficial 
[/td][/tr][/table][/td][/tr][/table]
\`\`\`

## Dica de Sanidade
Quando começamos a colocar tabelas dentro de outras tabelas, a quantidade de \`[\` e \`]\` pode ficar confusa.
Para não se perder:
* **Use indentação:** empurre partes do código para a direita. Assim, fica fácil enxergar o que pertence a cada “nível” de estrutura.
* **Use comentários (se o fórum permitir)**: marque onde termina cada bloco importante do layout.

Dominar esse aninhamento é o que permite criar praticamente qualquer layout que você imaginar, o limite passa a ser apenas a sua criatividade.
          `,
    activity: {
      question: "Um [td] (aninhado) afeta a estrutura da [table]?",
      options: ["Sim, ela quebra a [table].", "Não, ela vive isolada dentro de sua célula ([td]), comportando-se como um conteúdo comum (como uma imagem ou texto).", "Sim, elas se fundem.", "Tabelas não podem ser aninhadas."],
      correctIndex: 1,
      explanation: "Para a [table], a [td] é apenas conteúdo. Ela não sabe que é uma tabela, apenas exibe o bloco."
    }
  },
  'style-intro': {
    id: 'style-intro',
    title: '6_Estilização_CSS',
    category: 'avançado',
    content: `
# 06. A Arte da Pintura (CSS)

Seu BBCode já está montado, a estrutura está firme, tudo organizado, mas ainda parece um rascunho em preto e branco, com aquelas bordas cinzas e sem vida que o próprio Forumeiros aplica por padrão.
Agora é a hora de transformar esse esboço em algo com identidade, textura e personalidade, e é aqui que entra o **CSS**.

O CSS (Cascading Style Sheets) é a linguagem que diz como algo vai aparecer, mas ele não funciona abrindo e fechando blocos como \`[b][/b]\` ou \`[i][/i]\`.
Em vez disso, ele entra como uma “informação extra” dentro de uma tag que já existe.

Pensa assim:
* A tag é o objeto: por exemplo, uma célula de tabela \`[td]\`.
* O CSS é um rótulo com instruções visuais que você cola nesse objeto.
* Esse rótulo, no BBCode, fica dentro do atributo \`style=""\`.
* Dentro das aspas, você escreve cada propriedade seguida de dois pontos e um valor, separando cada par por ponto e vírgula.

Sempre que usarmos CSS direto na tag, seguiremos este formato:

Exemplo¹: \`[table style="propriedade: valor; propriedade: valor"]\`

Cada “propriedade: valor;” é uma instrução de estilo, como:

Exemplo²: \`[td style="border: none!important; color:#000000"]\`

Aqui:

* \`[td]\` é o espaço onde o conteúdo vai ficar.

* \`style="..."\` é o “adesivo”.

* Dentro de \`style=""\` você escreve as regras: \`border: none!important\` (sem bordas), \`color:#000000;\` (texto preto).

Então, quando falo que:
### “O CSS não é uma tag, ele é um atributo. É como um adesivo que colamos na tag para mudar suas propriedades. O adesivo se chama \`style=""\`.”

Queremos dizer: você não cria algo como [css][/css] para aplicar estilo; você pega a tag que já existe (a tabela, a célula, o bloco) e adiciona o atributo \`style=""\` para dizer como ela deve ser exibida (cor, tamanho, borda, espaçamento etc.).

---
## Falando a Língua do Design
O CSS é uma linguagem elegante, mas rígida.
Como citado anteriormente, sua base é sempre um par formado por propriedade e valor, como no Exemplo².

> **Mantra do CSS:** "O que eu mudo" **dois pontos** "Para quanto eu mudo" **ponto e vírgula**

Exemplo: \`style="color: red;"\`

*   \`color\` (O que eu mudo? A cor do texto)
*   \`:\` (Separação)
*   \`red\` (Para qual valor? Vermelho)
*   \`;\` (Fim da ordem. Próxima!)

### Por que tantos policiais erram?
Porque tentam "adivinhar" ou usar lógica de português.
*   ❌ \`style="cor = azul"\` (Errado! O fórum não compreende programação em português e não usa igualdade para propriedades).
*   ✅ \`style="color: blue;"\` (Certo!)

## Onde a mágica acontece
Você pode aplicar o estilo na \`[table]\` (afeta toda a “construção”) ou diretamente na \`[td]\` (altera apenas aquele “quarto” específico).

**Exemplo de transformação:**

* **Sem CSS:** uma caixa transparente com texto preto.

* **Com CSS:**
\`\`\`
[table style="border:none!important; overflow: hidden; border-radius: 15px" bgcolor="a2a2a2"][tr style="border: none!important"][td style="border: none!important; color:#000000"]Texto[/td][/tr][/table]\`\`\`
Vira um cartão cinza elegante e com um texto na cor preta.

Algumas propriedades, como \`text-align\`, \`font-size\`, \`font-family\`, \`font-weight\` e \`color\`, ajudam muito a evitar repetição de tags (por exemplo, vários \`[b]\`, \`[center]\`, \`[font]\`) e reduzem a poluição visual do código, porque você controla o estilo direto no \`style=""\`, em vez de empilhar BBCodes ao redor do texto.

[SPOILER title="Definições"]
\`text-align\`: define o alinhamento do texto.
Valor: left, center, right, justify.

\`font-size\`: define o tamanho da fonte.
Valor: em pixels (12px, 14px, 16px, 20px), em porcentagem (100%, 120%) ou relativos (1em, 1.2em).

\`font-family\`: define a família tipográfica.
Valor: Arial, Verdana, Tahoma, Georgia, Times New Roman (sempre de preferência com uma opção genérica no final, como sans-serif ou serif, por exemplo: font-family: Arial, sans-serif;).

\`font-weight\`: define a “espessura” do texto.
Valor: normal, bold, ou numéricos (400, 600, 700), de 100 em 100.

\`color\`: define a cor do texto.
Valor: nomes de cores (red, white, black), códigos hexadecimais (#ffffff, #000000, #4d7684) ou RGB (rgb(255, 255, 255)).

\`line-height\`: define o espaço entre uma linha de texto e a próxima.
Valores maiores (1.3em, 1.4em, 1.5em) deixam o texto mais arejado e fácil de ler. Enquanto os muito baixos “amassam” as linhas, criando sensação de bloco pesado.

\`letter-spacing\`: define o espaço horizontal entre os caracteres.
Valores positivos em pixels (12px, 14px, 16px, 20px) afastam as letras, deixando o texto mais aberto. Enquanto os negativos aproximam as letras, útil para alguns títulos ou logos.
[/SPOILER]

Não tenha medo de experimentar, pois o pior que pode acontecer é ficar feio e, se isso acontecer, é só apagar e tentar de novo.
          `,
    activity: {
      question: "Qual pontuação é obrigatória no final de cada comando CSS (ex: color: red)?",
      options: ["Vírgula (,)", "Ponto Final (.)", "Ponto e Vírgula (;)", "Dois Pontos (:)"],
      correctIndex: 2,
      explanation: "O Ponto e Vírgula (;) diz ao fórum: Terminei este comando, pode ler o próximo. Sem ele, os as propriedades e valores se misturam e o código quebra."
    }
  },
  'css-arsenal': {
    id: 'css-arsenal',
    title: '7_Acabamento_de_Elite',
    category: 'avançado',
    content: `
# 07. Acabamento de Elite: Detalhes que Importam

O que separa um noob de um pro não é a complexidade, é o **acabamento**.
Agora, vou te entregar as ferramentas que eu uso em 100% dos meus BBCodes.

---

## 1. Width - Largura e Responsividade

A propriedade \`width\` controla a largura do elemento na tela. É como dizer “até onde essa caixa pode se estender na horizontal”. Quando você fixa essa largura em pixels (por exemplo, \`width: 800px\`) na \`[table]\` principal ou \`[td]\`, ela pode ficar grande demais para telas pequenas, como celulares, fazendo o layout “vazar” para fora da tela.

Por isso, é melhor combinar valores relativos e limites, usando algo como:
\`max-width: 600px; width: 100%;\` ou somente o \`width: 100%;\`.

Em termos práticos:

* \`width\`: 100% diz: “ocupe toda a largura disponível do espaço em que você está”.
* \`max-width\`: 600px diz: “mas não passe de 600px, mesmo em telas grandes”.

Assim, em um monitor, sua ficha fica com no máximo 600px, centrada e agradável; em um celular, ela se adapta e encolhe junto com a tela, sem quebrar.

Já a propriedade height não costuma ser usada na estrutura de BBCodes, seja em \`[table]\` ou \`[td]\`, porque a altura quase sempre é definida automaticamente pela quantidade de conteúdo dentro da célula. Quanto mais texto, imagens e elementos você colocar, maior ela fica. Forçar uma altura fixa (height: 400px, por exemplo) pode cortar conteúdo ou gerar espaços vazios desnecessários, por isso, na maioria dos casos, é melhor deixar que a altura seja ajustada pelo próprio conteúdo. Portanto, recomendo somente a utilização da propriedade \`width\` em **porcentagem (%)**. 

## 2. Border: none!important - Adeus Bordas!

O \`border: none !important\`; é o comando que “zera” as bordas padrão que o Forumeiros aplica, limpando aquele contorno cinza que aparece em tabelas.

Quando você está criando um BBCode, é essencial aplicar essa regra em todos os níveis da estrutura:

* Na \`[table]\`: remove a borda da estrutura principal.
* No \`[tr]\`: impede que cada linha fique com traços separados.
* No \`[td]\`: evita que cada célula ganhe um contorno próprio.

Em CSS inline, a lógica é assim:

\`\`\`
[table style="border: none !important"][tr style="border: none !important"][td style="border: none !important"]
      Texto aqui.
[/td][/tr][/table]\`\`\`

## 3. Border-Radius e Overflow: O Círculo Perfeito
O border-radius controla o arredondamento dos cantos de uma caixa.

* Quando você usa \`border-radius: 10px;\`, os cantos ficam levemente arredondados.
* Quando usa \`border-radius: 50%\`; em um elemento que é um quadrado (largura igual à altura), o formato final tende a um círculo.
* Ou seja, o \`border-radius\` mexe apenas na forma da borda da caixa, não no conteúdo (texto, imagem, etc) em si. O conteúdo continua inteiro dentro daquele espaço.

É aí que entra o \`overflow\`.
A propriedade \`overflow\` diz o que fazer com o conteúdo que passa dos limites da caixa.

* Com o padrão (\`overflow: visible;\`), tudo que “vaza” continua aparecendo para fora.
* Com \`overflow: hidden;\`, qualquer parte do conteúdo que ultrapassar a borda é cortada e não aparece.

Juntando os dois:
* \`border-radius: 50%;\` deixa a borda da caixa redonda.

* \`overflow: hidden;\` garante que tudo o que sair dessa borda redonda seja cortado.

Resultado: se você coloca uma imagem dentro de uma caixa quadrada com essas duas propriedades, a borda vira um círculo e o  \`overflow: hidden;\` recorta a imagem exatamente no formato circular. E é assim que se consegue o efeito de avatar redondo! 

**Atenção**: NUNCA se esqueça de usar o \`overflow: hidden\` na \`[table]\`, seja ela principal, secundária, etc.

[SPOILER title="Outras maneiras"]
\`border-radius: T D B E;\` - Define a curvatura dos 4 lados de uma vez, na ordem: Topo, Direita, Baixo, Esquerda.

**Exemplo:** \`border-darius: 10px 5px 10px 5px;\`
[/SPOILER]

## 4. bgcolor e background-color - Dando vida e cor

O \`bgcolor=""\` e o \`background-color\` fazem a mesma coisa (mudar a cor de fundo), mas pertencem a “camadas” diferentes.

* \`bgcolor=""\`: é um atributo HTML antigo, usado direto na tag, por exemplo:

Exemplo¹: \`[td style="border: none!important" bgcolor="#ff0000"]\`

Exemplo²: \`[table style="border: none!important; overflow: hidden; border-radius: 15px" bgcolor="#ff0000"]\`

Define a cor no próprio HTML, é considerado legado e evita-se em código moderno.

Já \`background-color\`: #hexcolor;: é uma propriedade CSS, usada no \`style\` ou em classes, por exemplo:

* Exemplo¹: \`[td style="background-color: #ff0000;"]\`

* Exemplo2: \`[table style="border: none!important; overflow: hidden; border-radius: 15px; background-color: #ff0000;"]\`

É a forma recomendada hoje, pois separa estrutura (HTML) de estilo (CSS). Pois quando os dois aparecem juntos na mesma célula, o navegador prioriza o CSS (\`background-color\`), então é essa cor que vale.

[SPOILER title="Colorindo as bordas"]
Também é possível colorir as bordas, com \`border: solid 1px #hexcolor\`, que é uma declaração completa de borda: ela diz como é a linha, o quão grossa e de que cor.

\`solid\`: linha reta, contínua, sem traços.

\`1px\`: espessura bem fina.

\`#hexcolor\`: código da cor, por exemplo #ffffff (branco), #000000 (preto), #ff9900 (laranja).

Quando você escreve isso direto no elemento, por exemplo:

Exemplo: \`[table style="border: none !important; border: solid 1px #ff0000;"]\`
Aqui percebemos que essa borda pertence especificamente a esse \`[table]\`.

Uma curiosidade: o border: none !important; deveria essa propriedade quando aplica no mesmo elemento, mas o Forumeiros é cheio de pegadinhas, por isso funciona normalmente com ou sem.[/SPOILER]

## 5. Box-Shadow: Profundidade
O mundo real não é plano, até porque as coisas projetam sombras.
E exatemnte isso que o \`box-shadow\` cria: uma sombra em volta da caixa para dar sensação de profundidade, como se o elemento estivesse acima do fundo.

Exemplo: \`box-shadow: 0px 5px 15px rgba(0,0,0,0.5);\`

Aqui:

* \`0px\` → deslocamento horizontal.

* \`5px\` → deslocamento vertical.

* \`15px\` → desfoque da sombra.

* Dentro do rgba temos 4 valores, organizado da seguinte maneira (0 - Red, 0 - Green, 0 - Blue, 0.5 - Transparência, sendo 1 pouco transparente e 0.1 muito transparente)

* \`rgba(0,0,0,0.5)\` → cor da sombra: preto com 50% de transparência, para não ficar pesada.

Usando esse conjunto, seu BBCode parece um card levemente elevado, destacando-se visualmente do fundo do fórum.`,
    activity: {
      question: "Qual propriedade é utilizada para arredondar as bordas?",
      options: ["width: 100%", "border-radius", "overflow: hidden", "border: none!important"],
      correctIndex: 1,
      explanation: "É essa propriedade do CSS que arredonda as bordas dos elementos, enquanto width, overflow e border têm outras funções (largura, controle de extravasamento e desenho da borda)."
    }
  },
  'layout-mastery': {
    id: 'layout-mastery',
    title: '8_Geometria_do_Layout',
    category: 'avançado',
    content: `
# 08. Geometria do Layout: Position e Espaçamento

Agora que já sabemos deixar nosso BBCode com um visual bonito, é hora de entender a geometria do layout.

Ou seja, como posicionar cada elemento exatamente onde queremos e garantir o espaço certo entre eles.

É aqui que entram propriedades importantes como position, alinhamentos, margin e padding que nos ajudam a construir BBCodes bem organizadas, equilibradas e com um grande diferencial. Antes de sair aplicando tudo, vamos entender como cada uma funciona e por que elas fazem tanta diferença no resultado final.

---

## 1. position: como o bloco se comporta no layout
Pense em **position** como o “modo de funcionamento” da \`[table]\`. Ela indica se o elemento entra na fila normal ou se ganha liberdade para ser deslocado.

Os modos mais importantes para você são:

### position: static;
É o padrão. O elemento segue a ordem natural: um \`[table]\` depois da outra, uma tabela depois da outra.
Aqui, \`top\`, \`left\`, \`right\`, \`bottom\` praticamente não têm efeito.

### position: relative;
O elemento mantém sua posição normal, mas você pode dar pequenos “empurrões” com \`top\`, \`left\`, \`right\` e \`bottom\`. É ótimo para ajustes finos.
\`\`\`
[table style="width: 20%; border: none!important; overflow: hidden; position: relative; top: -20px; left: 600px;" bgcolor="60808a"][tr style="border: none!important;"][td style="border: none!important;"]Texto levemente ajustado
[/td][/tr][/table]
\`\`\`
Ele continua ocupando o mesmo “espaço” na tabela, só desliza um pouco.

### position: absolute;
O elemento sai da fila e passa a ser posicionado em relação ao primeiro “pai” que também tenha position (normalmente relative).
Você usa isso para coisas como selos, ícones, etiquetas no canto.

\`\`\`
[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; color: #ffffff; font-size: 14px; font-family: 'Poppins', sans-serif;" bgcolor="60808a"][tr style="border: none!important;"][td style="border: none!important; position: relative; padding: 20px; border: 1px solid #ccc;"]Teste[/td]
      [td style="border: none!important; border-radius: 15px; position: absolute; top: 63px; right: 220px; background-color: #d63031; color: white; padding: 3px 6px; font-size: 10px;"][b]ON[/b]
      Conteúdo da célula aqui[/td][/tr][/table]
\`\`\`
Aqui o “ON” fica grudado no canto da célula, independente do texto.

### position: fixed; e sticky;
Em BBCode de fórum, você quase não usa, mas vale conhecer:
* \`fixed:\` o elemento fica preso à tela, mesmo quando você rola a página.
* \`sticky:\` o elemento se comporta normalmente, mas “cola” em um ponto ao rolar.

> **Guarde a ideia principal:** \`position\` decide se o elemento fica na fila ou se pode ser “puxado” para um lugar específico.

---

## 2. top, left, right, bottom: quanto você move
Depois de definir o “modo” com \`position\`, vem o “quanto”, que é controlado por \`top\`, \`left\`, \`right\` e \`bottom\`.

Eles só fazem sentido quando o elemento tem position diferente de \`static\` (por exemplo, \`relative\` ou \`absolute\`).

* \`top:\` distância em relação ao topo.
* \`left:\` distância em relação à esquerda.
* \`right:\` distância em relação à direita.
* \`bottom:\` distância em relação à parte de baixo.

**Exemplo visual:**

\`\`\`
[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; color: #ffffff; font-size: 14px; font-family: 'Poppins', sans-serif;" bgcolor="60808a"][tr style="border: none!important;"][td style="border: none!important; position: relative; padding: 20px; border: 1px solid #ccc;"]Teste[/td]
      [td style="border: none!important; border-radius: 15px; position: absolute; top: 63px; right: 220px; background-color: #d63031; color: white; padding: 3px 6px; font-size: 10px;"][b]ON[/b]
      Conteúdo da célula aqui[/td][/tr][/table]
\`\`\`

**Metáfora:** imagine um quadro pregado na parede.
\`position\` diz se ele está fixo no meio ou se pode ser movido; \`top\` e \`right\` são os centímetros que você mede com a trena para colocá-lo no ponto exato.

---

## 3. margin em [table] ou [td]: espaço externo
Agora, vamos falar sobre espaço EXTERNO.

\`margin\` em \`[table]\` ou \`[td]\` controla o espaço externo, ou seja, a distância entre os elementos e o que está ao redor (como títulos, parágrafos ou outras tabelas).

\`\`\`
[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px;" bgcolor="60608a"][tr style="border: none!important;"][td style="border: none!important;"][table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; margin: 200px auto;" bgcolor="60808a"][tr style="border: none!important;"][td style="border: none!important;"]Teste[/td][/tr][/table][/td][/tr][/table]
\`\`\`
Aqui você está dizendo:
* 200px em cima e embaixo → a tabela não fica colada em nada.
* auto nas laterais → costuma centralizar a tabela na área disponível.

Pense na tabela como um quadro grande na parede do fórum; **margin** é o espaço entre o quadro e os outros elementos visuais à volta. Em resumo: valor maior, espaço maior; valor menor, espaço menor, simples assim!

**Usos típicos:**
* Descolar um botão do BBCode para acessar algum arquivo/link.
* Criar um “respiro” entre duas grandes tabelas.

[SPOILER title="Outras maneiras"]
\`margin-top\` - Para distanciar somente do topo.

\`margin-bottom\` - Para distanciar somente do fundo.

\`margin-left\` - Para distanciar somente da esquerda.

\`margin-right\` - Para distanciar somente da direita.

\`margin: T D B E;\` - Define o distanciamento dos 4 lados de uma vez, na ordem: Topo, Direita, Baixo, Esquerda.

**Exemplo:** \`margin: 10px 20px 10px 20px;\`[/SPOILER]
---

## 4. padding em [td]: espaço interno
Agora, o protagonista dos BBCodes da RCC: \`padding\`.

\`padding\` é o espaço interno da célula, entre a borda e o conteúdo (texto, ícone, imagem).

* **Sem padding:** o \`[td]\` adota o padrão de distanciamento das bordas do Forumeiros.
* **Com padding:** você pode diminuir (0px) ou aumentar (10px, 15px, 25px, etc) o espaçamento interno

* **Sem padding:**
\`\`\`
[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; color: white" bgcolor="60608a"][tr style="border: none!important;"][td style="border: none!important;"]Sem padding[/td][/tr][/table]
\`\`\`

* **Com padding:**
\`\`\`
[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; color: white" bgcolor="60608a"][tr style="border: none!important;"][td style="border: none!important; padding: 0px"]Com padding em 0px[/td][/tr][/table]

[table style="width: 70%; border: none!important; overflow: hidden; border-radius: 15px; color: white" bgcolor="60608a"][tr style="border: none!important;"][td style="border: none!important; padding: 40px"]Com padding em 40px[/td][/tr][/table]
\`\`\`

[SPOILER title="Outras maneiras"]
\`padding: T D B E;\` - Define o distanciamento dos 4 lados de uma vez, na ordem: Topo, Direita, Baixo, Esquerda.

**Exemplo:** \`padding: 10px 0px 10px 0px;\`
[/SPOILER]

---

## 5. Margin x Padding: como fixar de vez
Se você realmente guardar essa ideia, já vai ficar na frente de muita gente que ainda se enrola com esse assunto.

\`margin\`
* Espaço fora da borda.
* Em \`[table]\`: afasta a tabela dos outros elementos.
* Em \`[td]\`: tenta afastar a célula das coisas ao redor (com limitações em tabela).

**padding**
* Espaço dentro da borda.
* Em \`[td]\`: afasta o texto da borda da célula, deixando o conteúdo respirar melhor.

**Regra prática para [table]:**
* “Meu BBCode está grudado no resto da página” → pense em **margin** na \`[table]\`.
* “Meu texto está colado nas bordas da célula” → use **padding** no \`[td]\`.
* “Quero colocar um ícone ou um detalhe em posição exata” → combine **position** com **top/left/right/bottom**.

A partir do momento em que você domina esses conceitos, seu BBCode deixa de ser apenas correto e passa a ter acabamento de projeto, com tudo no lugar certo e com o espaço certo.
          `,
    activity: {
      question: "Se o seu texto está 'grudado' nas bordas internas da célula, qual propriedade resolve isso?",
      options: ["margin", "padding", "position: absolute", "top: 10px"],
      correctIndex: 1,
      explanation: "Padding cria um 'colchão' interno, afastando o conteúdo das bordas da própria célula."
    }
  },
  'color-theory': {
    id: 'color-theory',
    title: '09_Psicologia_das_Cores',
    category: 'avançado',
    content: `
# 09. A Psicologia das Cores e a Comunicação Visual

Chegamos à parte em que a técnica encontra a alma do seu código. As cores não estão ali apenas para “enfeitar”: elas falam. Elas podem transmitir sensação de perigo, de calma, de magia ou de tecnologia antes mesmo de ler a primeira palavra do seu texto.

Nesta lição, vamos ver como escolher cores que contam uma história e como usá‑las de forma consciente para guiar o olhar de quem lê, destacando o que é importante e reforçando o clima que você quer criar.

---

## 1. O Vocabulário Oculto das Cores
Antes de começarmos a aplicar cores em tables ou textos, precisamos entender como o cérebro humano reage, quase de forma automática, a cada tom. As cores costumam ser a primeira coisa que se percebe, mesmo antes de prestar atenção ao conteúdo em si.

### O Peso do Vermelho
O vermelho é uma cor de impacto: ele tende a acelerar o batimento cardíaco e chamar a atenção imediatamente. É a cor do **“PARE”**, do **“ERRO”** e da **“MÁXIMA URGÊNCIA”**, por isso precisa ser usada com bastante cuidado, já que o excesso pode gerar sensação de ansiedade em quem vê.

Em termos de aplicação prática, o vermelho funciona muito bem para mensagens de erro crítico, alertas importantes do sistema e botões de ação destrutiva, como excluir, remover ou banir um usuário.

<div style="background:linear-gradient(to right, #450a0a, #280505); border-left:4px solid #ef4444; padding:20px; border-radius:4px; margin-bottom:20px; font-family:'Verdana', sans-serif; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
   <div style="color:#ef4444; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      FALHA CRÍTICA
   </div>
   <div style="color:#fca5a5; font-size:14px; font-family:'Fira Code', monospace;">
      Conexão com o BBCode.Lab foi interrompida.
   </div>
</div>

### A Calma do Azul 
O azul é uma cor ligada ao campo mental: ele acalma, transmite estabilidade, lógica e sensação de ordem. Em interfaces, costuma passar credibilidade e conforto visual, por isso é um dos tons mais usados em telas e sistemas.

Na prática, o azul funciona muito bem em caixas de informação, cabeçalhos de regras, links e áreas com leitura mais densa, onde o objetivo é manter o leitor focado e tranquilo.

<div style="background:#0f172a; border:1px solid #1e3a8a; border-radius:8px; padding:20px; margin-bottom:20px; font-family:'Inter', sans-serif; position:relative; overflow:hidden;">
   <div style="display:flex; gap:15px; align-items:start;">
      <div style="background:#1e40af; padding:10px; border-radius:8px; color:white;">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      </div>
      <div>
         <div style="color:#60a5fa; font-weight:bold; font-size:14px; margin-bottom:4px;">Nota Informativa</div>
         <div style="color:#93c5fd; font-size:13px; line-height:1.6;">
            Este tópico contém diretrizes atualizadas para a formatação de relatórios. Por favor, leia atentamente antes de postar.
         </div>
      </div>
   </div>
</div>

### O Equilíbrio do Verde
O verde fica aproximadamente no centro do espectro visível e, por isso, costuma exigir menos esforço dos nossos olhos, sendo percebido como uma cor confortável e equilibrada. Ele está muito associado a ideias de “Siga”, “Correto”, “Lucro”, “Saúde” e “Crescimento”, tanto em interfaces quanto em sinais do dia a dia.

Na prática, o verde funciona muito bem em notificações de sucesso, status “Online”, mensagens de confirmação, aprovações e em indicadores de resultados positivos, como balanços ou progresso concluído.

<div style="background:#052e16; border:1px solid #059669; padding:15px 20px; border-radius:50px; display:inline-flex; align-items:center; gap:12px; margin-bottom:20px; box-shadow:0 0 15px rgba(16, 185, 129, 0.2);">
   <div style="width:10px; height:10px; background:#10b981; border-radius:50%; box-shadow:0 0 8px #10b981;"></div>
   <span style="color:#d1fae5; font-family:'Kanit', sans-serif; font-size:13px; letter-spacing:0.5px;">Aula de Segurança postada com sucesso!</span>
</div>

---

## 2. A Regra de Ouro: 60-30-10
Muitos iniciantes erram ao tentar usar **todas** as cores ao mesmo tempo. O segredo de um design incrível está na **proporção** entre elas.

Pense que você está montando um tema “dark mode” para o seu BBCode: você escolhe uma cor principal para dominar o ambiente, uma ou duas cores de apoio para detalhes e, se precisar, uma cor de destaque para chamar a atenção em pontos específicos, em vez de transformar tudo em carnaval visual.

1.  **60% - A Cor Base**
É a cor dominante, geralmente mais neutra. Em temas escuros, por exemplo, costuma aparecer em tons de cinza como #18181b ou #09090b. Ela existe justamente para **não** chamar atenção: se o fundo grita, o texto perde força e “morre” na leitura.
2.  **30% - A Cor Secundária**
    Define a estrutura: fundos de caixas de texto, bordas suaves, cabeçalhos. Precisa ter contraste suficiente com a cor base para aparecer com clareza, mas não tanto a ponto de roubar a cena. Um exemplo é o tom #27272a.
3.  **10% - A Cor de Destaque**
    É aqui que a mágica acontece: é a sua **accent color**. Use essa cor para links, títulos importantes, botões e pequenos detalhes. Ela deve ser, de preferência, a única cor realmente vibrante da sua paleta, justamente para se destacar quando for usada.

**Exemplo Prático:**

<div style="display:flex; flex-direction:column; gap:0;">
    <!-- 60% Base -->
    <div style="background:#18181b; color:#71717a; padding:15px; font-size:10px; font-family:monospace; border-top-left-radius:8px; border-top-right-radius:8px;">
        CAMADA 1 (60%): Fundo Neutro (#18181b)
    </div>
    <!-- 30% Secundária -->
    <div style="background:#27272a; padding:20px; border-left:1px solid #3f3f46; border-right:1px solid #3f3f46;">
        <span style="color:#a1a1aa; font-size:10px; font-family:monospace; display:block; margin-bottom:5px;">CAMADA 2 (30%): Caixa de Conteúdo (#27272a)</span>
        <div style="color:#e4e4e7; font-size:14px; font-family:'Inter', sans-serif;">
            Aqui vai o seu texto longo. Perceba como ele descansa sobre o cinza médio.
        </div>
    </div>
    <!-- 10% Destaque -->
    <div style="background:#27272a; padding:15px; border-bottom-left-radius:8px; border-bottom-right-radius:8px; border:1px solid #3f3f46; border-top:none; text-align:right;">
         <span style="color:#ffc000; font-weight:bold; font-size:12px; letter-spacing:1px; cursor:pointer;">VER PERFIL &rarr;</span>
         <div style="color:#ffc000; font-size:8px; opacity:0.7; margin-top:2px;">CAMADA 3 (10%): Ação/Link (#ffc000)</div>
    </div>
</div>

---

## 3. Temperatura e Saturação
Não basta dizer “vou usar azul”. Mas sim qual azul?

### Saturação (Neon vs Pastel): 
* **Cores muito saturadas (neon)** cansam a vista se usadas em grandes áreas, enquanto **cores mais apagadas (pastel)** transmitem calma e elegância.

* **Dica:** evite usar vermelho puro (#FF0000) ou azul puro (#0000FF) como fundo; eles geram uma vibração cromática tão forte que chegam a causar desconforto visual. Prefira sempre escurecer um pouco ou reduzir a saturação da cor.

### Temperatura (Quente vs Frio):
* **Cores quentes (laranja, vermelho, amarelo):** aproximam o objeto, parecem “saltar” da tela e funcionam muito bem para avisos, alertas e elementos que precisam chamar atenção imediata.

* **Cores frias (azul, roxo, verde):** afastam o objeto visualmente, criam sensação de profundidade e atmosfera, sendo ótimas para fundos e áreas onde o olhar pode descansar.
---

## 4. Laboratório Prático
Role a página até encontrar a seção chamada **“Laboratório de Contraste”**. Lá você vai conseguir testar, em tempo real, a regra 60-30-10 e ver como a proporção de cores afeta a leitura.

Lembre-se: O contraste é rei. Se o leitor precisa apertar os olhos para ler, o design falhou, não importa quão bonita seja a cor.
          `,
    activity: {
      question: "Na regra 60-30-10, para que serve a cor dos 10% (Destaque)?",
      options: ["Para pintar o fundo da página inteira e chamar atenção.", "Para escrever textos longos e cansativos.", "Para guiar o olhar do usuário a pontos chave, como botões, links e títulos.", "Para criar bordas invisíveis."],
      correctIndex: 2,
      explanation: "Os 10% são o **tempero** do design. Eles indicam onde o usuário deve clicar ou olhar, sem sobrecarregar a visão."
    }
  }
};
const ChevronRightIcon = () => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
const ChevronDownIcon = () => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "m6 9 6 6 6-6"
}));
const FolderIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: "1",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",
  fill: "none"
}), React.createElement("path", {
  d: "M2 10h20",
  stroke: "none"
}));
const FolderOpenIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-3.25 7a2 2 0 0 1-1.8 1.18H7a2 2 0 0 1-2-2V2"
}), React.createElement("path", {
  d: "M4 2v18"
}));
const FileCodeIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
}), React.createElement("polyline", {
  points: "14 2 14 8 20 8"
}), React.createElement("path", {
  d: "m10 13-2 2 2 2"
}), React.createElement("path", {
  d: "m14 17 2-2-2-2"
}));
const SlidersIcon = ({
  className,
  size = 20
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("line", {
  x1: "4",
  x2: "4",
  y1: "21",
  y2: "14"
}), React.createElement("line", {
  x1: "4",
  x2: "4",
  y1: "10",
  y2: "3"
}), React.createElement("line", {
  x1: "12",
  x2: "12",
  y1: "21",
  y2: "12"
}), React.createElement("line", {
  x1: "12",
  x2: "12",
  y1: "8",
  y2: "3"
}), React.createElement("line", {
  x1: "20",
  x2: "20",
  y1: "21",
  y2: "16"
}), React.createElement("line", {
  x1: "20",
  x2: "20",
  y1: "12",
  y2: "3"
}), React.createElement("line", {
  x1: "2",
  x2: "6",
  y1: "14",
  y2: "14"
}), React.createElement("line", {
  x1: "10",
  x2: "14",
  y1: "8",
  y2: "8"
}), React.createElement("line", {
  x1: "18",
  x2: "22",
  y1: "16",
  y2: "16"
}));
const PaletteIcon = ({
  className,
  size = 20
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("circle", {
  cx: "13.5",
  cy: "6.5",
  r: ".5",
  fill: "currentColor"
}), React.createElement("circle", {
  cx: "17.5",
  cy: "10.5",
  r: ".5",
  fill: "currentColor"
}), React.createElement("circle", {
  cx: "8.5",
  cy: "7.5",
  r: ".5",
  fill: "currentColor"
}), React.createElement("circle", {
  cx: "6.5",
  cy: "12.5",
  r: ".5",
  fill: "currentColor"
}), React.createElement("path", {
  d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
}));
const HelpCircleIcon = ({
  size = 14,
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), React.createElement("path", {
  d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
}), React.createElement("path", {
  d: "M12 17h.01"
}));
const CheckCircle2Icon = ({
  size = 16
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const XCircleIcon = ({
  size = 16
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), React.createElement("path", {
  d: "m15 9-6 6"
}), React.createElement("path", {
  d: "m9 9 6 6"
}));
const FileTreeItem = ({
  node,
  depth,
  activeLessonId,
  onSelectLesson
}) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (node.lessonId) {
      onSelectLesson(node.lessonId);
    }
  };
  const isActive = node.lessonId === activeLessonId;
  return React.createElement("div", {
    className: "font-inter select-none"
  }, React.createElement("div", {
    className: `group flex items-center py-1 px-3 cursor-pointer text-[12px] transition-colors border-l-2
                ${isActive ? 'bg-[#27272A] text-white border-[#8B5CF6]' : 'text-[#71717a] hover:bg-[#18181b] hover:text-[#d4d4d8] border-transparent'}
              `,
    style: {
      paddingLeft: `${depth * 10 + 12}px`
    },
    onClick: handleToggle
  }, React.createElement("span", {
    className: "mr-1.5 opacity-70 group-hover:text-white transition-colors shrink-0"
  }, node.type === 'folder' ? isOpen ? React.createElement(ChevronDownIcon, null) : React.createElement(ChevronRightIcon, null) : React.createElement("span", {
    className: "w-3"
  })), React.createElement("span", {
    className: "mr-2 shrink-0"
  }, node.type === 'folder' ? isOpen ? React.createElement(FolderOpenIcon, {
    className: "text-[#a1a1aa] group-hover:text-white"
  }) : React.createElement(FolderIcon, {
    className: "text-[#71717a] group-hover:text-zinc-400"
  }) : React.createElement(FileCodeIcon, {
    className: isActive ? 'text-[#8B5CF6]' : 'text-[#71717a] group-hover:text-[#a78bfa]'
  })), React.createElement("span", {
    className: `truncate ${isActive ? 'font-medium' : 'font-normal'}`
  }, node.name)), node.type === 'folder' && isOpen && node.children && React.createElement("div", null, node.children.map(child => React.createElement(FileTreeItem, {
    key: child.id,
    node: child,
    depth: depth + 1,
    activeLessonId: activeLessonId,
    onSelectLesson: onSelectLesson
  }))));
};
const Sidebar = ({
  nodes,
  activeLessonId,
  onSelectLesson
}) => {
  return React.createElement("div", {
    className: "app-sidebar w-60 bg-[#111113] h-full flex flex-col border-r border-[#27272A] z-10"
  }, React.createElement("div", {
    className: "px-4 py-3 text-[10px] font-bold text-[#52525b] tracking-widest uppercase flex justify-between items-center"
  }, React.createElement("span", null, "Explorer")), React.createElement("div", {
    className: "flex-1 overflow-y-auto custom-scrollbar pt-1"
  }, nodes.map(node => React.createElement(FileTreeItem, {
    key: node.id,
    node: node,
    depth: 0,
    activeLessonId: activeLessonId,
    onSelectLesson: onSelectLesson
  }))));
};
const BoxShadowPlayground = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(5);
  const [blur, setBlur] = useState(15);
  const [color, setColor] = useState("#8B5CF6");
  const [opacity, setOpacity] = useState(50);
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  };
  const rgbaColor = hexToRgba(color, opacity);
  const shadowString = `${x}px ${y}px ${blur}px ${rgbaColor}`;
  const pureShadowString = `box-shadow: ${x}px ${y}px ${blur}px ${rgbaColor};`;
  return React.createElement("div", {
    className: "my-8 p-6 rounded-xl border border-[#27272A] bg-[#131316] relative overflow-hidden group"
  }, React.createElement("div", {
    className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22d3ee]"
  }), React.createElement("div", {
    className: "flex items-center gap-2 mb-6 text-[#e4e4e7] font-kanit text-lg"
  }, React.createElement(SlidersIcon, {
    size: 20,
    className: "text-[#8B5CF6]"
  }), React.createElement("span", null, "Simulador de Box-Shadow")), React.createElement("div", {
    className: "flex flex-col md:flex-row gap-8"
  }, React.createElement("div", {
    className: "flex-1 space-y-4 font-mono text-xs text-zinc-400"
  }, React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between mb-1"
  }, React.createElement("span", null, "Eixo X (Horizontal)"), " ", React.createElement("span", null, x, "px")), React.createElement("input", {
    type: "range",
    min: "-50",
    max: "50",
    value: x,
    onChange: e => setX(Number(e.target.value)),
    className: "w-full accent-[#8B5CF6] h-1 bg-[#27272A] rounded appearance-none"
  })), React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between mb-1"
  }, React.createElement("span", null, "Eixo Y (Vertical)"), " ", React.createElement("span", null, y, "px")), React.createElement("input", {
    type: "range",
    min: "-50",
    max: "50",
    value: y,
    onChange: e => setY(Number(e.target.value)),
    className: "w-full accent-[#8B5CF6] h-1 bg-[#27272A] rounded appearance-none"
  })), React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between mb-1"
  }, React.createElement("span", null, "Blur (Desfoque)"), " ", React.createElement("span", null, blur, "px")), React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: blur,
    onChange: e => setBlur(Number(e.target.value)),
    className: "w-full accent-[#8B5CF6] h-1 bg-[#27272A] rounded appearance-none"
  })), React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between mb-1"
  }, React.createElement("span", null, "Cor"), " ", React.createElement("span", {
    style: {
      color: color
    }
  }, color)), React.createElement("input", {
    type: "color",
    value: color,
    onChange: e => setColor(e.target.value),
    className: "w-full h-8 bg-transparent border border-[#27272A] rounded cursor-pointer"
  })), React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between mb-1"
  }, React.createElement("span", null, "Opacidade"), " ", React.createElement("span", null, opacity, "%")), React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: opacity,
    onChange: e => setOpacity(Number(e.target.value)),
    className: "w-full accent-[#8B5CF6] h-1 bg-[#27272A] rounded appearance-none"
  }))), React.createElement("div", {
    className: "flex-1 flex flex-col items-center justify-center p-8 bg-[#09090b] rounded-lg border border-[#27272A] relative"
  }, React.createElement("div", {
    className: "w-24 h-24 bg-[#18181b] rounded-lg border border-[#27272A] flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase transition-all duration-100",
    style: {
      boxShadow: shadowString
    }
  }, "Card"))), React.createElement("div", {
    className: "mt-6 pt-4 border-t border-[#27272A]"
  }, React.createElement("div", {
    className: "text-[10px] uppercase text-zinc-500 font-bold mb-2"
  }, "Código Gerado"), React.createElement("code", {
    className: "block bg-[#09090b] p-3 rounded border border-[#27272A] text-[#a78bfa] font-mono text-xs select-all"
  }, pureShadowString)));
};
const ColorPaletteDemo = () => {
  const [bgColor, setBgColor] = useState("#18181b");
  const [textColor, setTextColor] = useState("#e4e4e7");
  const [accentColor, setAccentColor] = useState("#8B5CF6");
  return React.createElement("div", {
    className: "my-8 p-6 rounded-xl border border-[#27272A] bg-[#131316] relative overflow-hidden"
  }, React.createElement("div", {
    className: "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"
  }), React.createElement("div", {
    className: "flex items-center gap-2 mb-6 text-[#e4e4e7] font-kanit text-lg"
  }, React.createElement(PaletteIcon, {
    size: 20,
    className: "text-[#8B5CF6]"
  }), React.createElement("span", null, "Laboratório de Contraste")), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
  }, React.createElement("div", null, React.createElement("label", {
    className: "block text-[10px] font-bold text-zinc-500 uppercase mb-2"
  }, "Fundo (60%)"), React.createElement("div", {
    className: "flex items-center gap-2 bg-[#09090b] p-2 rounded border border-[#27272A]"
  }, React.createElement("input", {
    type: "color",
    value: bgColor,
    onChange: e => setBgColor(e.target.value),
    className: "w-8 h-8 rounded cursor-pointer bg-transparent border-none"
  }), React.createElement("span", {
    className: "font-mono text-xs text-zinc-400"
  }, bgColor))), React.createElement("div", null, React.createElement("label", {
    className: "block text-[10px] font-bold text-zinc-500 uppercase mb-2"
  }, "Texto (30%)"), React.createElement("div", {
    className: "flex items-center gap-2 bg-[#09090b] p-2 rounded border border-[#27272A]"
  }, React.createElement("input", {
    type: "color",
    value: textColor,
    onChange: e => setTextColor(e.target.value),
    className: "w-8 h-8 rounded cursor-pointer bg-transparent border-none"
  }), React.createElement("span", {
    className: "font-mono text-xs text-zinc-400"
  }, textColor))), React.createElement("div", null, React.createElement("label", {
    className: "block text-[10px] font-bold text-zinc-500 uppercase mb-2"
  }, "Destaque (10%)"), React.createElement("div", {
    className: "flex items-center gap-2 bg-[#09090b] p-2 rounded border border-[#27272A]"
  }, React.createElement("input", {
    type: "color",
    value: accentColor,
    onChange: e => setAccentColor(e.target.value),
    className: "w-8 h-8 rounded cursor-pointer bg-transparent border-none"
  }), React.createElement("span", {
    className: "font-mono text-xs text-zinc-400"
  }, accentColor)))), React.createElement("div", {
    className: "p-8 rounded-lg border border-dashed transition-colors duration-300",
    style: {
      backgroundColor: bgColor,
      borderColor: accentColor
    }
  }, React.createElement("h3", {
    className: "text-2xl font-bold mb-4 font-kanit",
    style: {
      color: accentColor
    }
  }, "Título de Impacto"), React.createElement("p", {
    className: "text-base leading-relaxed font-inter",
    style: {
      color: textColor
    }
  }, "Este é um exemplo de como seu texto ficaria. Perceba se é fácil de ler ou se seus olhos precisam fazer esforço. O design inclusivo prioriza o conforto visual. ", React.createElement("span", {
    style: {
      color: accentColor,
      fontWeight: 'bold'
    }
  }, "Links e destaques"), " ficam na cor vibrante."), React.createElement("div", {
    className: "mt-6 flex gap-3"
  }, React.createElement("button", {
    className: "px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-transform active:scale-95",
    style: {
      backgroundColor: accentColor,
      color: bgColor
    }
  }, "Ação Principal"), React.createElement("button", {
    className: "px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border",
    style: {
      borderColor: textColor,
      color: textColor
    }
  }, "Secundário"))), React.createElement("div", {
    className: "mt-4 text-[11px] text-zinc-500 italic text-center"
  }, "*Experimente combinações ruins (Fundo Vermelho + Texto Azul) para ver como o olho sofre."));
};
const Editor = ({
  lesson,
  username
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  useEffect(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    const container = document.getElementById('lesson-container');
    if (container) container.scrollTop = 0;
  }, [lesson, username]);
  const handleOptionClick = index => {
    if (selectedOption !== null) return;
    if (!lesson.activity) return;
    setSelectedOption(index);
    const correct = index === lesson.activity.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: {
          y: 0.7
        },
        colors: ['#8B5CF6', '#22d3ee', '#ffffff'],
        disableForReducedMotion: true
      });
    }
  };
  const renderExplanation = text => {
    const finalText = text.replace(/{USERNAME}/g, username);
    const parts = finalText.split(/```([\s\S]*?)```/g);
    return React.createElement("div", {
      className: "documentation-content font-inter text-zinc-300 text-[15px] leading-relaxed selection:bg-[#8B5CF6]/30 text-justify"
    }, parts.map((part, index) => {
      if (index % 2 === 1) {
        return React.createElement("div", {
          key: index,
          className: "my-5 rounded-md overflow-hidden border border-[#27272A] bg-[#0c0c0e] group relative shadow-lg text-left"
        }, React.createElement("div", {
          className: "flex items-center px-4 py-2 border-b border-[#27272A] bg-[#131316]"
        }, React.createElement("div", {
          className: "flex gap-1.5"
        }, React.createElement("div", {
          className: "w-2.5 h-2.5 rounded-full bg-[#ef4444]"
        }), React.createElement("div", {
          className: "w-2.5 h-2.5 rounded-full bg-[#fbbf24]"
        }), React.createElement("div", {
          className: "w-2.5 h-2.5 rounded-full bg-[#22c55e]"
        })), React.createElement("span", {
          className: "ml-auto text-[10px] text-zinc-500 font-mono font-bold tracking-wider"
        }, "BBCODE")), React.createElement("pre", {
          className: "p-4 font-mono text-[13px] text-[#a78bfa] overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed"
        }, part.trim()));
      }
      let html = part.replace(/\[SPOILER title="([^"]*)"\]([\s\S]*?)\[\/SPOILER\]/g, (match, title, content) => {
        return `
                        <details class="group my-4 border border-[#27272A] rounded-lg bg-[#131316] open:bg-[#18181b] transition-colors overflow-hidden">
                          <summary class="flex items-center gap-3 p-4 font-kanit font-semibold cursor-pointer select-none text-zinc-300 hover:text-white transition-colors list-none">
                            <span class="text-[#8B5CF6] transition-transform duration-200 group-open:rotate-90">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </span>
                            ${title}
                          </summary>
                          <div class="px-4 pb-4 pt-0 text-zinc-400 text-[14px] leading-relaxed border-t border-[#27272A] pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            ${content.trim().replace(/\n/g, '<br />')}
                          </div>
                        </details>
                      `;
      }).replace(/\[EXAMPLE title="([^"]*)"(?: img="([^"]*)")?\]([\s\S]*?)\[\/EXAMPLE\]/g, (match, title, img, content) => {
        const imagePart = img ? `<img src="${img}" class="w-full h-auto object-cover rounded-md mb-4 border border-[#27272A]" alt="${title}" loading="lazy" />` : '';
        return `
                        <div class="my-6 p-1 rounded-xl bg-gradient-to-br from-[#27272A] to-[#18181b] shadow-lg">
                          <div class="bg-[#131316] rounded-lg p-5 h-full border border-[#27272A]">
                             ${imagePart}
                             <div class="flex items-center gap-2 mb-3">
                                <div class="w-1 h-4 bg-[#8B5CF6] rounded-full"></div>
                                <h4 class="text-zinc-100 font-bold text-sm uppercase tracking-wide font-kanit">${title}</h4>
                             </div>
                             <div class="text-zinc-400 text-sm leading-relaxed text-justify">
                                ${content.trim()}
                             </div>
                          </div>
                        </div>
                      `;
      }).replace(/^# (.*$)/gm, `
                      <h1 class="text-3xl font-bold font-kanit text-white mt-12 mb-6 tracking-tight border-b border-[#27272A] pb-4 text-left">
                          <span class="text-[#8B5CF6] mr-2 opacity-80">#</span>$1
                      </h1>
                  `).replace(/^## (.*$)/gm, `
                      <h2 class="text-xl font-semibold font-kanit text-white mt-10 mb-4 flex items-center text-left">
                          <div class="w-1 h-5 bg-[#8B5CF6] rounded-full mr-3 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                          $1
                      </h2>
                  `).replace(/^### ❌ (.*$)/gm, `
                      <div class="mt-8 mb-3 flex items-center gap-3 text-left">
                         <div class="bg-[#450a0a] text-[#f87171] p-1.5 rounded-lg border border-[#f87171]/20">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                         </div>
                         <h3 class="text-base font-bold text-[#f87171] uppercase tracking-wide">$1</h3>
                      </div>
                  `).replace(/^### ✅ (.*$)/gm, `
                      <div class="mt-8 mb-3 flex items-center gap-3 text-left">
                         <div class="bg-[#064e3b] text-[#34d399] p-1.5 rounded-lg border border-[#34d399]/20">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                         </div>
                         <h3 class="text-base font-bold text-[#34d399] uppercase tracking-wide">$1</h3>
                      </div>
                  `).replace(/^### (?!✅|❌)(.*$)/gm, '<h3 class="text-lg font-bold text-zinc-100 mt-6 mb-2 ml-1 border-l-2 border-zinc-700 pl-3 text-left">$1</h3>').replace(/^(\d+)\.\s+(.*$)/gm, `
                      <div class="flex items-start gap-4 my-4 pl-2 group/list p-3 hover:bg-[#18181b] rounded-lg transition-colors border border-transparent hover:border-[#27272a]">
                          <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#27272a] text-[#8B5CF6] font-kanit font-bold text-lg border border-[#3f3f46] shadow-sm shrink-0 group-hover/list:border-[#8B5CF6] transition-all">$1</span>
                          <span class="text-zinc-300 text-[15px] leading-relaxed flex-1 pt-1">$2</span>
                      </div>
                  `).replace(/^[\*\-]\s+(.*$)/gm, `
                      <div class="flex items-start gap-3 my-2 pl-4 group/list">
                          <span class="text-[#8B5CF6] mt-2.5 shrink-0 opacity-60 group-hover/list:opacity-100 transition-opacity">
                              <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3"/></svg>
                          </span>
                          <span class="text-zinc-300 text-[15px] leading-relaxed flex-1">$1</span>
                      </div>
                  `).replace(/^> (.*$)/gm, `
                      <div class="my-8 relative group">
                          <div class="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6] to-[#22d3ee] rounded-l-lg opacity-80"></div>
                          <div class="bg-[#18181b] border border-[#27272A] border-l-0 rounded-r-lg p-5 pl-6 relative overflow-hidden">
                              <div class="absolute right-0 top-0 opacity-5 text-[#8B5CF6]">
                                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                              </div>
                              <div class="relative z-10 text-zinc-300 italic text-[15px] leading-relaxed">
                                  $1
                              </div>
                          </div>
                      </div>
                  `).replace(/^---$/gm, '<div class="h-px bg-[#27272A] w-full my-8"></div>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-[#27272A] px-1.5 py-0.5 rounded text-[#fbbf24] font-mono text-[12px] border border-[#3f3f46] shadow-sm inline-block mx-0.5">$1</code>').replace(/\n\n/g, '<div class="h-6"></div>').replace(/\n/g, ' ');
      return React.createElement("div", {
        key: index,
        dangerouslySetInnerHTML: {
          __html: html
        }
      });
    }), lesson.id === 'css-arsenal' && React.createElement(BoxShadowPlayground, null), lesson.id === 'color-theory' && React.createElement(ColorPaletteDemo, null));
  };
  return React.createElement("div", {
    className: "flex flex-col h-full bg-[#0F0F12] text-[#e4e4e7]"
  }, React.createElement("div", {
    className: "editor-header flex bg-[#0F0F12] border-b border-[#27272A] items-center px-6 h-12 select-none shrink-0 sticky top-0 z-20"
  }, React.createElement("span", {
    className: "editor-title font-kanit font-medium text-sm tracking-wide text-zinc-300"
  }, lesson.title), React.createElement("span", {
    className: "editor-category ml-auto text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2"
  }, React.createElement("span", {
    className: `w-1.5 h-1.5 rounded-full ${lesson.category === 'basics' ? 'bg-blue-500' : 'bg-[#8B5CF6]'}`
  }), lesson.category)), React.createElement("div", {
    id: "lesson-container",
    className: "lesson-container flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
  }, React.createElement("div", {
    className: "lesson-content max-w-3xl mx-auto px-6 py-8 pb-32"
  }, React.createElement("div", {
    className: "animate-in fade-in slide-in-from-bottom-2 duration-500"
  }, renderExplanation(lesson.content)), React.createElement("div", {
    className: "w-full h-px bg-[#27272A] my-8"
  }), lesson.activity && React.createElement("div", {
    className: "mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
  }, React.createElement("div", {
    className: "rounded-lg border border-[#27272A] bg-[#131316] overflow-hidden"
  }, React.createElement("div", {
    className: "bg-[#18181b] px-6 py-2.5 border-b border-[#27272A] flex items-center gap-2"
  }, React.createElement(HelpCircleIcon, {
    size: 14,
    className: "text-[#8B5CF6]"
  }), React.createElement("span", {
    className: "text-[10px] font-bold text-zinc-500 uppercase tracking-wider"
  }, "Desafio de Código")), React.createElement("div", {
    className: "p-6"
  }, React.createElement("h3", {
    className: "text-sm font-semibold text-zinc-200 mb-6 font-inter leading-snug"
  }, lesson.activity.question), React.createElement("div", {
    className: "space-y-2"
  }, lesson.activity.options.map((option, index) => {
    const isCode = option.includes('[') || option.includes(':');
    let btnClass = "border-[#27272A] bg-[#18181b] hover:bg-[#27272a] hover:border-zinc-600 text-zinc-400";
    let icon = null;
    if (selectedOption !== null) {
      if (index === lesson.activity.correctIndex) {
        btnClass = "border-[#10b981]/50 bg-[#064e3b]/20 text-[#34d399]";
        icon = React.createElement(CheckCircle2Icon, {
          size: 16
        });
      } else if (index === selectedOption) {
        btnClass = "border-[#ef4444]/50 bg-[#450a0a]/20 text-[#f87171]";
        icon = React.createElement(XCircleIcon, {
          size: 16
        });
      } else {
        btnClass = "border-transparent bg-transparent text-zinc-600 opacity-50";
      }
    }
    return React.createElement("button", {
      key: index,
      onClick: () => handleOptionClick(index),
      disabled: selectedOption !== null,
      className: `w-full text-left px-4 py-2.5 rounded text-[13px] border transition-all flex items-center justify-between font-mono ${btnClass}`
    }, React.createElement("span", {
      className: isCode ? "font-mono text-[12px]" : "font-inter"
    }, option), icon);
  })), selectedOption !== null && React.createElement("div", {
    className: `mt-4 pt-4 border-t border-[#27272A] text-[12px] leading-relaxed animate-in fade-in ${isCorrect ? 'text-[#34d399]' : 'text-zinc-400'}`
  }, React.createElement("span", {
    className: "font-bold mr-2 uppercase"
  }, isCorrect ? 'Solução' : 'Erro'), lesson.activity.explanation)))), React.createElement("div", {
    className: "h-16"
  }))));
};
const LogoCube = ({
  size = 32,
  className = ""
}) => React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  className: className
}, React.createElement("path", {
  d: "M24 8L39 16.66V33.98L24 42.64L9 33.98V16.66L24 8Z",
  fill: "transparent",
  stroke: "#8B5CF6",
  strokeWidth: "2",
  strokeLinejoin: "round"
}));
const FilesIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
}), React.createElement("polyline", {
  points: "14 2 14 8 20 8"
}));
const FormIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
}), React.createElement("path", {
  d: "M14 2v6h6"
}), React.createElement("path", {
  d: "M16 13H8"
}), React.createElement("path", {
  d: "M16 17H8"
}), React.createElement("path", {
  d: "M10 9H8"
}));
const TestIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M9 11l3 3L22 4"
}), React.createElement("path", {
  d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
}));
const GitGraphIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("circle", {
  cx: "5",
  cy: "6",
  r: "3"
}), React.createElement("path", {
  d: "M5 9v6"
}), React.createElement("circle", {
  cx: "5",
  cy: "18",
  r: "3"
}), React.createElement("path", {
  d: "M12 3v18"
}), React.createElement("circle", {
  cx: "19",
  cy: "6",
  r: "3"
}), React.createElement("path", {
  d: "M19 9v6"
}), React.createElement("circle", {
  cx: "19",
  cy: "18",
  r: "3"
}));
const SettingsIcon = ({
  className
}) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, React.createElement("path", {
  d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
}), React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const totalTime = 2000;
    const intervalTime = 30;
    const steps = totalTime / intervalTime;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(currentStep / steps * 100, 100);
      setProgress(currentProgress);
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, intervalTime);
    return () => clearInterval(interval);
  }, []);
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center font-mono text-xs select-none"
  }, React.createElement(LogoCube, {
    size: 48,
    className: "mb-4 animate-pulse"
  }), React.createElement("div", {
    className: "w-32 h-1 bg-[#27272A] rounded-full overflow-hidden"
  }, React.createElement("div", {
    className: "h-full bg-[#8B5CF6] transition-all duration-100 ease-out",
    style: {
      width: `${progress}%`
    }
  })), React.createElement("p", {
    className: "mt-4 text-[10px] text-zinc-500 tracking-wide"
  }, "Desenvolvido por .Brendon"));
};
const App = () => {
  const [activeLessonId, setActiveLessonId] = useState('intro');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Visitante");
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);
    pegarUsername().then(name => {
      if (name) {
        setUsername(name);
      }
    });
    return () => clearTimeout(timer);
  }, []);
  const activeLesson = LESSONS[activeLessonId];
  if (loading) {
    return React.createElement(LoadingScreen, null);
  }
  return React.createElement("div", {
    className: "app-shell flex h-screen w-screen bg-[#0F0F12] text-[#e4e4e7] overflow-hidden font-sans"
  }, React.createElement("div", {
    className: "activity-bar w-12 bg-[#09090b] flex flex-col items-center py-4 border-r border-[#27272A] z-20"
  }, React.createElement("div", {
    className: "mb-6 opacity-80 hover:opacity-100 transition-opacity"
  }, React.createElement(LogoCube, null)), React.createElement("div", {
    className: "w-full flex justify-center py-3 border-l-2 border-[#8B5CF6] cursor-pointer",
    title: "Explorer"
  }, React.createElement(FilesIcon, {
    className: "text-[#e4e4e7] w-6 h-6"
  })), React.createElement("a", {
    href: "https://bbcodelabform.netlify.app/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "w-full flex justify-center py-3 opacity-40 hover:opacity-100 hover:text-white cursor-pointer transition-opacity",
    title: "Formulário"
  }, React.createElement(FormIcon, {
    className: "text-[#a1a1aa] w-6 h-6"
  })), React.createElement("a", {
    href: "https://bbcodelabprev.netlify.app/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "w-full flex justify-center py-3 opacity-40 hover:opacity-100 hover:text-white cursor-pointer transition-opacity",
    title: "Teste de Conhecimento"
  }, React.createElement(TestIcon, {
    className: "text-[#a1a1aa] w-6 h-6"
  })), React.createElement("div", {
    className: "w-full flex justify-center py-3 opacity-40 hover:opacity-100 hover:text-white cursor-pointer transition-opacity",
    title: "Source Control"
  }, React.createElement(GitGraphIcon, {
    className: "text-[#a1a1aa] w-6 h-6"
  })), React.createElement("a", {
    href: "https://www.habbo.com.br/profile/.Brendon",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "developer-link mt-auto mb-2 w-full flex justify-center py-3 opacity-70 hover:opacity-100 cursor-pointer transition-opacity",
    "aria-label": "Desenvolvedor .Brendon - O rei dos BBCodes!"
  }, React.createElement("img", {
    src: "https://www.habbo.com.br/habbo-imaging/avatarimage?user=.Brendon&direction=2&head_direction=2&gesture=sml&size=m&headonly=1",
    alt: "Avatar do desenvolvedor .Brendon"
  }), React.createElement("span", {
    className: "developer-tooltip",
    role: "tooltip"
  }, "Desenvolvedor .Brendon - O rei dos BBCodes!"))), React.createElement(Sidebar, {
    nodes: FILE_TREE,
    activeLessonId: activeLessonId,
    onSelectLesson: setActiveLessonId
  }), React.createElement("div", {
    className: "app-main flex-1 h-full min-w-0 bg-[#0F0F12]"
  }, activeLesson ? React.createElement(Editor, {
    lesson: activeLesson,
    username: username
  }) : React.createElement("div", {
    className: "h-full flex flex-col items-center justify-center text-[#52525b]"
  }, React.createElement("p", {
    className: "text-xs font-mono"
  }, "NO FILE OPEN"))));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
