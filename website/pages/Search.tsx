import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Project } from "../api/model";
import { search } from "../api";

export default function Search() {
  const [val, setVal] = useState("");
  const [results, setResults] = useState<Project[]>([]);
  useEffect(() => {
    (async () => setResults(await search(val)))();
  }, [val]);

  return (
    <div>
      <input
        type="text"
        placeholder="469 Stevenson"
        value={val}
        onChange={useCallback(
          (e: ChangeEvent<HTMLInputElement>) => setVal(e.target.value),
          [setVal]
        )}
      ></input>
      <div>
        {results.map((r) => (
          <div key={r.ID}>
            <a href={`/project/${r.ID}`}>
              <span>{r.ID}</span> <strong>{r.NAME}</strong>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
