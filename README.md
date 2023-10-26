# Installing

```
npm i @taigawada/json-value-editor
```

# Getting Started

```javascript
import { JsonValueEditor, NestedObject } from "@taigawada/json-value-editor";
import JsonValueEditorStyle from "@taigawada/json-value-editor/style.css";

const [json, setJson] = useState < NestedObject > { sample: 1234 };
const handleJsonChange = useCallback((json: NestedObject) => setJson(json), []);

return (
   <JsonValueEditor object={json} onChange={handleJsonChange} />;
)
```

# Props

| name                | required | default   |
| :------------------ | :------: | :-------- |
| object              |   true   | none      |
| onChange            |   true   | none      |
| errorMessage        |  false   | undefined |
| indentWidth         |  false   | 4         |
| changeType          |  false   | false     |
| convertTextToNumber |  false   | false     |
| nullFallback        |  false   | null      |
