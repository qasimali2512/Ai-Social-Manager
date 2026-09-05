import {
  Bot,
  ChevronDown,
  Hash,
  Languages,
  Maximize2,
  MessageSquareText,
  Ruler,
  Sparkles,
} from "lucide-react";

function PostComposer({
  topic,
  setTopic,
  platform,
  setPlatform,
  tone,
  setTone,
  language,
  setLanguage,
  length,
  setLength,
  includeHashtags,
  setIncludeHashtags,
  includeEmoji,
  setIncludeEmoji,
  accounts,
  platforms,
  loading,
  onGenerate,

  width,
  height,
  setWidth,
  setHeight,
  sizePreset,
  onPresetChange,
  onWidthChange,
  onHeightChange,
  selectedPreset,
}) {
  return (
    <div className="create-card composer-card">

      {/* HEADER */}
      <div className="card-heading">

        <div className="heading-icon">
          <Sparkles size={19} />
        </div>

        <div className="heading-content">
          <h2>Create with AI</h2>

          <p>
            Describe your idea and let AI create the post for you.
          </p>
        </div>

        <div className="ai-ready">
          <span />
          AI Ready
        </div>

      </div>

      {/* TOPIC */}
      <div className="field-group topic-field">

        <label>
          <MessageSquareText size={15} />
          What do you want to post?
        </label>

        <div className="textarea-wrapper">

          <textarea
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value)
            }
            placeholder="Example: Launch announcement for our new AI product..."
            rows={6}
            maxLength={5000}
          />

          <span className="character-count">
            {topic.length}/5000
          </span>

        </div>

      </div>

      {/* PLATFORM */}
      <div className="field-group">

        <label>
          <Bot size={15} />
          Platform
        </label>

        <div className="select-wrapper">

          <select
            value={platform}
            onChange={(event) =>
              setPlatform(event.target.value)
            }
          >

            <option value="">
              Select platform
            </option>

            {accounts.length > 0 &&
              accounts.map((account) => {

                const value =
                  account.platform ||
                  account.platform_key ||
                  account.username ||
                  account.id;

                const label =
                  account.username ||
                  account.account_name ||
                  account.name ||
                  value;

                return (
                  <option
                    key={`account-${account.id}`}
                    value={value}
                  >
                    {label}
                  </option>
                );
              })}

            {platforms.map((item) => (

              <option
                key={`platform-${item.id}`}
                value={
                  item.key ||
                  item.slug ||
                  item.name
                }
              >
                {item.name}
              </option>

            ))}

          </select>

          <ChevronDown size={16} />

        </div>

      </div>

      {/* OPTIONS */}
      <div className="composer-grid">

        {/* TONE */}
        <div className="field-group">

          <label>
            <Sparkles size={14} />
            Tone
          </label>

          <div className="select-wrapper">

            <select
              value={tone}
              onChange={(event) =>
                setTone(event.target.value)
              }
            >

              <option value="professional">
                Professional
              </option>

              <option value="friendly">
                Friendly
              </option>

              <option value="casual">
                Casual
              </option>

              <option value="witty">
                Witty
              </option>

              <option value="inspirational">
                Inspirational
              </option>

              <option value="educational">
                Educational
              </option>

              <option value="persuasive">
                Persuasive
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

        </div>

        {/* LANGUAGE */}
        <div className="field-group">

          <label>
            <Languages size={14} />
            Language
          </label>

          <div className="select-wrapper">

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >

              <option value="English">
                English
              </option>

              <option value="Urdu">
                Urdu
              </option>

              <option value="Roman Urdu">
                Roman Urdu
              </option>

              <option value="Spanish">
                Spanish
              </option>

              <option value="French">
                French
              </option>

              <option value="German">
                German
              </option>

              <option value="Arabic">
                Arabic
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

        </div>

        {/* LENGTH */}
        <div className="field-group">

          <label>
            <MessageSquareText size={14} />
            Length
          </label>

          <div className="select-wrapper">

            <select
              value={length}
              onChange={(event) =>
                setLength(event.target.value)
              }
            >

              <option value="short">
                Short
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="long">
                Long
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

        </div>

      </div>

      {/* IMAGE SIZE */}
      <div className="image-size-section">

        <div className="image-size-header">

          <div className="image-size-title">

            <div className="size-icon">
              <Ruler size={16} />
            </div>

            <div>
              <h3>Image Size</h3>

              <p>
                Choose one size that works across your
                selected social platforms.
              </p>
            </div>

          </div>

          <div className="current-size">
            {width} × {height} px
          </div>

        </div>

        {/* PRESET */}
        <div className="field-group preset-field">

          <label>
            Platform Size Preset
          </label>

          <div className="select-wrapper">

            <select
              value={sizePreset}
              onChange={onPresetChange}
            >

              <option value="universal">
                Universal — 1200 × 1200
              </option>

              <option value="instagram_square">
                Instagram Square — 1080 × 1080
              </option>

              <option value="instagram_portrait">
                Instagram Portrait — 1080 × 1350
              </option>

              <option value="instagram_story">
                Instagram Story — 1080 × 1920
              </option>

              <option value="linkedin">
                LinkedIn — 1200 × 627
              </option>

              <option value="facebook">
                Facebook — 1200 × 630
              </option>

              <option value="twitter">
                X / Twitter — 1600 × 900
              </option>

              <option value="custom">
                Custom
              </option>

            </select>

            <ChevronDown size={16} />

          </div>

          <span className="preset-description">
            {selectedPreset.description}
          </span>

        </div>

        {/* WIDTH + HEIGHT */}
        <div className="dimension-grid">

          <div className="dimension-field">

            <label>
              Width
            </label>

            <div className="dimension-input">

              <input
                type="number"
                min="100"
                max="4096"
                value={width}
                onChange={onWidthChange}
              />

              <span>px</span>

            </div>

          </div>

          <div className="dimension-field">

            <label>
              Height
            </label>

            <div className="dimension-input">

              <input
                type="number"
                min="100"
                max="4096"
                value={height}
                onChange={onHeightChange}
              />

              <span>px</span>

            </div>

          </div>

        </div>

        {/* SIZE INFO */}
        <div className="size-summary">

          <div>
            <span>Width</span>
            <strong>{width} px</strong>
          </div>

          <div>
            <span>Height</span>
            <strong>{height} px</strong>
          </div>

          <div>
            <span>Aspect Ratio</span>
            <strong>
              {height
                ? (width / height).toFixed(2)
                : "1.00"}
              :1
            </strong>
          </div>

          <div className="resize-icon">
            <Maximize2 size={17} />
          </div>

        </div>

      </div>

      {/* TOGGLES */}
      <div className="generation-options">

        <label className="toggle-option">

          <span className="toggle-icon">
            <Hash size={15} />
          </span>

          <span className="toggle-label">
            Include hashtags
          </span>

          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(event) =>
              setIncludeHashtags(
                event.target.checked
              )
            }
          />

          <span className="custom-toggle">
            <span />
          </span>

        </label>

        <label className="toggle-option">

          <span className="toggle-icon emoji-icon">
            ✨
          </span>

          <span className="toggle-label">
            Include emoji
          </span>

          <input
            type="checkbox"
            checked={includeEmoji}
            onChange={(event) =>
              setIncludeEmoji(
                event.target.checked
              )
            }
          />

          <span className="custom-toggle">
            <span />
          </span>

        </label>

      </div>

      {/* GENERATE */}
      <button
        className="generate-button"
        onClick={onGenerate}
        disabled={
          loading ||
          !topic.trim()
        }
      >

        {loading ? (
          <>
            <span className="button-spinner" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate with AI
          </>
        )}

      </button>

    </div>
  );
}

export default PostComposer;