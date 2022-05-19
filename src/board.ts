import type { ShapeProps } from "@mirohq/websdk-types";
import cardImage from "./assets/card.jpeg";

export const API_URL = "https://opentdb.com";
const CARD_IMG_URL = `${location.protocol}//${location.host}${cardImage}`;

const WIDTH = 500;
const HEIGHT = WIDTH;

const defaultCardProps: ShapeProps = {
  style: {
    fillColor: "#ffffff",
    fontSize: 20,
    textAlign: "left",
  },
  width: WIDTH,
  height: HEIGHT,
};

function shuffle(array: unknown[]) {
  const local = [...array];
  for (var i = local.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = local[i];
    local[i] = local[j];
    local[j] = temp;
  }

  return local;
}

export async function get(
  endpoint: string = API_URL,
  params: Record<string, string> = {}
) {
  const url = new URL(`${API_URL}/${endpoint}`);
  url.search = new URLSearchParams(params).toString();

  return await fetch(url.toString()).then((res) => res.json());
}

async function getCoordinates() {
  const viewport = await miro.board.viewport.get();
  return {
    x: viewport.x + 200,
  };
}

async function createTriviaCard(trivia: any) {
  const answers = shuffle([...trivia.incorrect_answers, trivia.correct_answer]);
  const coordinates = await getCoordinates();

  const answerContent = answers
    .map((a, i) => `<p><b>${++i}</b> - ${a}</p>`)
    .join("");

  const content = `
    <p><b>${trivia.question}</b></p>
    <br>
    ${answerContent}
  `;

  await miro.board.createShape({
    ...defaultCardProps,
    ...coordinates,
    style: {
      ...defaultCardProps.style,
      textAlign: "center",
    },
    content: trivia.correct_answer,
  });

  await miro.board.createShape({
    ...coordinates,
    ...defaultCardProps,
    content: content,
  });
}

export async function generate(
  opts: { amount?: string; category?: string } = {}
) {
  const { results = [] } = await get("api.php", opts);
  const coordinates = await getCoordinates();

  for (let trivia of results) {
    await createTriviaCard(trivia);
  }

  const cover = await miro.board.createImage({
    ...getCoordinates(),
    url: CARD_IMG_URL,
    width: WIDTH,
  });

  await miro.board.createText({
    ...coordinates,
    content: "Time to play!",
    style: {
      fontSize: 40,
      textAlign: "center",
    },
    parentId: cover.id,
  });

  await miro.board.viewport.zoomTo(cover);
  await miro.board.ui.closePanel();
}
