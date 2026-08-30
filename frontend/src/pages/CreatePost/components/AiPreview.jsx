import {
  Check,
  Clipboard,
  Edit3,
  Image,
  RefreshCw,
  Sparkles,
} from "lucide-react";

function AiPreview({
  content,
  imageUrl,
  hashtags,
  onContentChange,
  onCopy,
  onRegenerate,
  onSaveDraft,
  onSchedule,
  loading,
}) {
  const displayHashtags =
    hashtags.length > 0
      ? hashtags
      : extractHashtags(content);

  return (
    <div className="create-card preview-card">

      {/* HEADER */}
      <div className="card-heading preview-heading">

        <div className="heading-icon">
          <Sparkles size={19} />
        </div>

        <div className="heading-content">

          <h2>AI Preview</h2>

          <p>
            Review and edit your generated content before saving.
          </p>

        </div>

        {content && (
          <div className="generated-badge">
            <Check size={13} />
            Generated
          </div>
        )}

      </div>

      {!content ? (

        /* EMPTY */
        <div className="empty-preview">

          <div className="empty-preview-icon">
            <Sparkles size={30} />
          </div>

          <h3>
            Your AI post will appear here
          </h3>

          <p>
            Enter a topic and click
            <strong> Generate with AI </strong>
            to create your content.
          </p>

        </div>

      ) : (

        <div className="preview-body">

          {/* IMAGE */}
          {imageUrl && (
            <div className="generated-image">

              <img
                src={imageUrl}
                alt="AI generated post"
              />

              <div className="image-label">
                <Image size={14} />
                AI generated media
              </div>

            </div>
          )}

          {/* CAPTION */}
          <div className="preview-editor">

            <div className="editor-top">

              <span>
                <Edit3 size={14} />
                Caption
              </span>

              <button
                className="copy-button"
                onClick={onCopy}
                title="Copy content"
              >
                <Clipboard size={16} />
              </button>

            </div>

            <textarea
              value={content}
              onChange={(event) =>
                onContentChange(
                  event.target.value
                )
              }
              rows={9}
            />

            <div className="content-count">
              {content.length} characters
            </div>

          </div>

          {/* HASHTAGS */}
          {displayHashtags.length > 0 && (
            <div className="hashtag-section">

              <div className="section-mini-title">

                <span>
                  Hashtags
                </span>

                <span>
                  {displayHashtags.length}
                </span>

              </div>

              <div className="hashtag-list">

                {displayHashtags.map(
                  (tag, index) => (

                    <span
                      className="hashtag"
                      key={`${tag}-${index}`}
                    >
                      {tag.startsWith("#")
                        ? tag
                        : `#${tag}`}
                    </span>

                  )
                )}

              </div>

            </div>
          )}

          {/* ACTIONS */}
          <div className="preview-actions">

            <button
              className="preview-action regenerate"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Regenerate
            </button>

            <button
              className="preview-action save"
              onClick={onSaveDraft}
            >
              <Check size={16} />
              Save Draft
            </button>

            <button
              className="preview-action schedule"
              onClick={onSchedule}
            >
              <Sparkles size={16} />
              Schedule Post
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

function extractHashtags(text = "") {
  const matches =
    text.match(/#[a-zA-Z0-9_]+/g);

  return matches || [];
}

export default AiPreview;