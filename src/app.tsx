import * as React from "react";
import ReactDOM from "react-dom";

import { get, generate } from "./board";

const questions = [10, 20, 30, 40, 50];

type Category = {
  id: string;
  name: string;
};

function App() {
  const [amount, setAmount] = React.useState("10");
  const [category, setCategory] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const loadCategories = async () => {
      const { trivia_categories = [] } = await get("api_category.php");
      setCategories(trivia_categories);
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsGenerating(true);
    await generate({
      amount,
      category,
    });
    setIsGenerating(false);

    return false;
  };

  const handleNumberQuestions = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAmount(e.target.value);
  };

  const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="number-of-questions">
          How many questions do you want to generate?
        </label>
        <select
          className="select"
          id="number-of-questions"
          onChange={handleNumberQuestions}
        >
          {questions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select className="select" id="category" onChange={handleCategory}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className={`button button-primary ${isGenerating && "button-loading"}`}
        type="submit"
        disabled={isGenerating}
      >
        Generate
      </button>
    </form>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
