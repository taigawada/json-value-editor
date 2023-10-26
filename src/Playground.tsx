import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { JsonValueEditor } from "../lib/index.js";
import "./main.css";

function App() {
  const sample = {
    article: {
      articleId: 144,
      title: "How did the QWERTY keyboard come about?",
      description: null,
      author: {
        authorId: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Smith",
        certification: true,
      },
    },
  };
  const [json, setJson] = useState(sample);
  const handleJsonChange = useCallback((newJson: typeof sample) => {
    setJson(newJson);
  }, []);
  const [textJson, setTextJson] = useState(JSON.stringify(json, null, 4));
  const [textJsonEditing, setTextJsonEditing] = useState(false);
  const [jsonParseError, setJsonParseError] = useState(false);
  const handleTextareaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setTextJson(e.target.value),
    []
  );
  useEffect(() => {
    if (!textJsonEditing) {
      setTextJson(JSON.stringify(json, null, 4));
    }
  }, [json, textJsonEditing]);
  useEffect(() => {
    try {
      setJson(JSON.parse(textJson));
      setJsonParseError(false);
    } catch {
      setJsonParseError(true);
    }
  }, [textJson]);

  return (
    <div>
      <h1 className="text-3xl text-center font-bold pt-16">
        JSON Value Editor
      </h1>
      <h1 className="text-2xl text-center font-bold pt-4 pb-8">Playground</h1>
      <div className="w-full max-w-3xl mx-auto my-4">
        <JsonValueEditor
          object={json}
          onChange={handleJsonChange}
          nullFallback={""}
        ></JsonValueEditor>
      </div>
      <div className="w-full max-w-3xl mx-auto my-4">
        <textarea
          className={`w-full h-64 font-mono focus:outline outline-2 ${
            jsonParseError ? "outline-red-300" : "outline-sky-300"
          }`}
          spellCheck={false}
          onChange={handleTextareaChange}
          value={textJson}
          onFocus={() => setTextJsonEditing(true)}
          onBlur={() => setTextJsonEditing(false)}
        ></textarea>
      </div>
    </div>
  );
}

export default App;
