import { useState, type ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Copy, ExternalLink, X } from "lucide-react";

export const App = () => {
  const [responseCode, setResponseCode] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [responseStatus, setResponseStatus] = useState<boolean>(true);
  const [stackOption, setStackOption] = useState<string>("");

  const handleEditorChange = (value: string | undefined): void => {
    if (value) setResponseCode(value);
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const getResponseCode = async () => {
    try {
      if (prompt) {
        setResponseCode("");
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/generate-code`,
          { prompt: `${prompt} using ${stackOption}` },
          { headers: { "Content-Type": "application/json" } }
        );

        const refineResponse = response.data.response
          .replaceAll("```", "")
          .replace("html", "");

        setResponseStatus(false);
        setResponseCode(refineResponse);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionChange = (option: string) => setStackOption(option);

  return (
    <>
      <div className="h-screen flex flex-col md:flex-row gap-4 p-3 bg-gray-950 text-white selection:bg-white selection:text-gray-900">
        {/* LEFT SIDE */}
        <div className="bg-gray-900 p-6 rounded-2xl w-full md:w-1/2 flex flex-col justify-between shadow-lg">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="font-semibold text-xl md:text-2xl">
                Choose a Stack
              </h2>
              <Select onValueChange={handleOptionChange}>
                <SelectTrigger className="bg-gray-800 text-white border-gray-700 w-full md:w-auto">
                  <SelectValue placeholder="Choose a tech stack..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border border-gray-700">
                  <SelectGroup>
                    <SelectItem value="HTML + CSS">HTML + CSS</SelectItem>
                    <SelectItem value="HTML + TailwindCSS">
                      HTML + TailwindCSS
                    </SelectItem>
                    <SelectItem value="HTML + CSS + JS">
                      HTML + CSS + JS
                    </SelectItem>
                    <SelectItem value="HTML + TailwindCSS + JS">
                      HTML + TailwindCSS + JS
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <textarea
                placeholder="Ex. Create a landing, blog, or portfolio website..."
                name="prompt"
                id="prompt"
                value={prompt}
                onChange={handleTextareaChange}
                className="resize-none h-48 md:h-56 w-full p-4 bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-sky-600 rounded-xl tracking-wide"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={getResponseCode}
              className="relative bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
            >
              Generate Code
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-gray-900 rounded-2xl w-full md:w-1/2 h-[60vh] md:h-auto relative shadow-lg overflow-hidden">
          <Editor
            defaultLanguage="html"
            language="html"
            onChange={handleEditorChange}
            theme="vs-dark"
            value={responseCode}
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              readOnly: responseStatus,
              fontSize: 14,
            }}
          />

          {responseCode && (
            <div className="absolute z-20 flex flex-wrap justify-center md:justify-end gap-3 right-4 bottom-4">
              <button
                onClick={() => navigator.clipboard.writeText(responseCode)}
                className="bg-white hover:bg-gray-200 flex items-center gap-2 cursor-pointer text-black text-sm md:text-base font-semibold px-3 py-1.5 rounded-lg shadow"
              >
                Copy <Copy size={18} />
              </button>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2 cursor-pointer text-white text-sm md:text-base font-semibold px-3 py-1.5 rounded-lg shadow"
              >
                Preview <ExternalLink size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW OVERLAY */}
      {isPreviewOpen && responseCode.trim() && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
          <div className="relative h-full w-full">
            <button
              className="absolute top-4 right-4 bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-full shadow-lg"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X size={20} />
            </button>
            <iframe
              srcDoc={responseCode}
              className="w-full h-full rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
