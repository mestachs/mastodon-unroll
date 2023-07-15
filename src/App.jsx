import { useEffect, useState } from "react";
import TurndownService from "turndown";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const params = new URLSearchParams(window.location.search);

  const [currentTab, setCurrentTab] = useState(2);
  const [url, setUrl] = useState(
    params.get("q") || "https://mastodon.green/@mestachs/110525572477536095"
  );
  const [markdown, setMarkdown] = useState("");
  const [thread, setThread] = useState();

  var turndownService = new TurndownService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let parsedUrl = new URL(url);
        const user = url.split("/").slice(-2, -1)[0].slice(1);
        const id = url.split("/").pop();
        let apiContextUrl =
          "https://" + parsedUrl.host + "/api/v1/statuses/" + id + "/context";
        let apiStatusUrl =
          "https://" + parsedUrl.host + "/api/v1/statuses/" + id;

        const contextInfo = await fetch(apiContextUrl).then((r) => r.json());
        const statusInfo = await fetch(apiStatusUrl).then((r) => r.json());
        const threads = contextInfo.ancestors
          .concat([statusInfo])
          .concat(contextInfo.descendants);

        setThread(threads);
        const snippet = threads
          .filter((post) => post.account.acct == user)
          .flatMap((post) => {
            const medias = post.media_attachments.map(
              (media) => "![](" + media.url + ")\n"
            );

            return [turndownService.turndown(post.content)].concat(medias);
          })
          .join("\n\n");
        setMarkdown(snippet);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
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
