import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import PostComposer from "./components/PostComposer";
import AiPreview from "./components/AiPreview";

import "./CreatePost.css";

function CreatePost() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState("medium");

  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);

  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);
  const [sizePreset, setSizePreset] = useState("universal");

  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    loadAccounts();
    loadPlatforms();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/social-accounts", {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      setAccounts(
        Array.isArray(data)
          ? data
          : data.accounts || data.data || []
      );
    } catch {
      setAccounts([]);
    }
  };

  const loadPlatforms = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/platforms", {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      setPlatforms(
        Array.isArray(data)
          ? data
          : data.platforms || data.data || []
      );
    } catch {
      setPlatforms([]);
    }
  };

  const presets = {
    universal: {
      label: "Universal",
      width: 1200,
      height: 1200,
      description: "Works well across major platforms",
    },

    instagram_square: {
      label: "Instagram Square",
      width: 1080,
      height: 1080,
      description: "Optimized for Instagram square posts",
    },

    instagram_portrait: {
      label: "Instagram Portrait",
      width: 1080,
      height: 1350,
      description: "Optimized for Instagram portrait posts",
    },

    instagram_story: {
      label: "Instagram Story",
      width: 1080,
      height: 1920,
      description: "Optimized for Instagram Stories",
    },

    linkedin: {
      label: "LinkedIn",
      width: 1200,
      height: 627,
      description: "Optimized for LinkedIn feed posts",
    },

    facebook: {
      label: "Facebook",
      width: 1200,
      height: 630,
      description: "Optimized for Facebook posts",
    },

    twitter: {
      label: "X / Twitter",
      width: 1600,
      height: 900,
      description: "Optimized for X / Twitter",
    },
  };

  const handlePresetChange = (event) => {
    const value = event.target.value;

    setSizePreset(value);

    if (presets[value]) {
      setWidth(presets[value].width);
      setHeight(presets[value].height);
    }
  };

  const handleWidthChange = (event) => {
    setWidth(Number(event.target.value));
    setSizePreset("custom");
  };

  const handleHeightChange = (event) => {
    setHeight(Number(event.target.value));
    setSizePreset("custom");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/posts/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            topic,
            platform,
            tone,
            language,
            length,
            include_hashtags: includeHashtags,
            include_emoji: includeEmoji,
            width,
            height,
            image_width: width,
            image_height: height,
            size_preset: sizePreset,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to generate content.");
      }

      const data = await response.json();

      setContent(
        data.content ||
          data.caption ||
          data.post ||
          data.generated_content ||
          ""
      );

      setHashtags(
        data.hashtags ||
          data.tags ||
          []
      );

      setImageUrl(
        data.image_url ||
          data.imageUrl ||
          data.image ||
          ""
      );
    } catch (err) {
      setError(err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleSaveDraft = async () => {
    if (!content) return;

    try {
      await fetch("http://127.0.0.1:8000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content,
          platform,
          status: "draft",
          hashtags,
          width,
          height,
        }),
      });
    } catch {
      // Keep UI functional even if API is unavailable
    }
  };

  const handleSchedule = () => {
    // Existing schedule flow can be connected here.
  };

  const selectedPreset =
    presets[sizePreset] || {
      label: "Custom",
      width,
      height,
      description: "Custom image dimensions",
    };

  return (
    <div className="create-post-page">

      <div className="create-post-background">
        <div className="glow-orb glow-one" />
        <div className="glow-orb glow-two" />
        <div className="grid-pattern" />
      </div>

      <main className="create-post-content">

        {/* PAGE HEADER */}
        <section className="create-page-header">

          <div className="header-copy">

            <span className="eyebrow">
              AI CONTENT STUDIO
            </span>

            <h1>
              Create your next
              <span> great post.</span>
            </h1>

            <p>
              Generate engaging social content with AI,
              refine it, and save it directly to your workspace.
            </p>

          </div>

          <button
            className="view-posts-button"
            onClick={() => {
              window.location.href = "/posts";
            }}
          >
            <span>View Posts</span>
            <ArrowUpRight size={17} />
          </button>

        </section>

        {/* ERROR */}
        {error && (
          <div className="create-error">

            <div className="error-left">
              <span className="error-dot" />

              <div>
                <strong>Network Error</strong>
                <span>{error}</span>
              </div>
            </div>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>

          </div>
        )}

        {/* MAIN GRID */}
        <section className="create-workspace">

          <PostComposer
            topic={topic}
            setTopic={setTopic}
            platform={platform}
            setPlatform={setPlatform}
            tone={tone}
            setTone={setTone}
            language={language}
            setLanguage={setLanguage}
            length={length}
            setLength={setLength}
            includeHashtags={includeHashtags}
            setIncludeHashtags={setIncludeHashtags}
            includeEmoji={includeEmoji}
            setIncludeEmoji={setIncludeEmoji}
            accounts={accounts}
            platforms={platforms}
            loading={loading}
            onGenerate={handleGenerate}
            width={width}
            height={height}
            setWidth={setWidth}
            setHeight={setHeight}
            sizePreset={sizePreset}
            onPresetChange={handlePresetChange}
            onWidthChange={handleWidthChange}
            onHeightChange={handleHeightChange}
            selectedPreset={selectedPreset}
          />

          <AiPreview
            content={content}
            imageUrl={imageUrl}
            hashtags={hashtags}
            onContentChange={setContent}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onSaveDraft={handleSaveDraft}
            onSchedule={handleSchedule}
            loading={loading}
          />

        </section>

      </main>

    </div>
  );
}

export default CreatePost;