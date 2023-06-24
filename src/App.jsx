import { useEffect, useState } from "react";
import TurndownService from "turndown";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [url, setUrl] = useState(
    "https://mastodon.green/@mestachs/110525572477536095"
  );
  const [markdown, setMarkdown] = useState("");
  const [thread, setThread] = useState();

  var turndownService = new TurndownService();

  useEffect(() => {
    try {
      let parsedUrl = new URL(url);
      const id = url.split("/").pop();
      let apiContextUrl =
        "https://" + parsedUrl.host + "/api/v1/statuses/" + id + "/context";

      fetch(apiContextUrl)
        .then((r) => r.json())
        .then((t) => {
          setThread(t);
          const snippet = t.ancestors
            .concat(t.descendants)
            .flatMap((post) => {
              const medias = post.media_attachments.map(
                (media) => "![](" + media.url + ")\n"
              );

              return [turndownService.turndown(post.content)].concat(medias);
            })
            .join("\n\n");
          setMarkdown(snippet);
        });
    } catch (err) {
      console.log(err);
    }
  }, [url]);
  return (
    <div className="App" role="main">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "800px" }}
      />
      <div className="tab">
        <button className="tablinks" onClick={() => setCurrentTab(0)}>
          Markdown
        </button>
        <button className="tablinks" onClick={() => setCurrentTab(1)}>
          Raw content
        </button>
        <button className="tablinks" onClick={() => setCurrentTab(2)}>
          Html
        </button>
      </div>
      {}
      {currentTab == 0 && thread && (
        <div className="tabcontent">
          <pre
            style={{
              background: "lightgrey",
              margin: "10px",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            {markdown}
          </pre>
        </div>
      )}

      {currentTab == 1 && thread && (
        <div className="tabcontent">
          <pre>{JSON.stringify(thread, undefined, 4)}</pre>
        </div>
      )}

      {currentTab == 2 && thread && (
        <div className="tabcontent">
          <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
        </div>
      )}
    </div>
  );
}

export default App;
