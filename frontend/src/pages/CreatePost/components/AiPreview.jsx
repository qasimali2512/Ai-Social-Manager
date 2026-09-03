import { useEffect, useState } from "react";

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
  saving,
}) {
  const displayHashtags =
    hashtags.length > 0
      ? hashtags
      : extractHashtags(content);

  // -----------------------------------------------
  // NEW: track whether the imageUrl we were given
  // actually loads. A URL can be present but still
  // fail (private/expired Supabase Storage link,
  // CORS block, 404, etc.), in which case the
  // browser shows a broken-image icon instead of
  // our placeholder. This resets whenever a new
  // imageUrl comes in and swaps to the placeholder
  // if loading fails.
  // -----------------------------------------------
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);

    if (imageUrl) {
      console.log(
        "[AiPreview] received imageUrl:",
        imageUrl
      );
    } else {
      console.log(
        "[AiPreview] no imageUrl in AI response for this post."
      );
    }
  }, [imageUrl]);

  const showImage =
    Boolean(imageUrl) && !imageFailed;

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
          {showImage ? (
            <div className="generated-image">

              <img
                src={imageUrl}
                alt="AI generated post"
                onError={() => {
                  // The URL was present but the
                  // browser could not actually load
                  // it (expired/private Supabase
                  // Storage link, CORS, 404, etc.)
                  console.error(
                    "[AiPreview] image failed to load:",
                    imageUrl
                  );
                  setImageFailed(true);
                }}
              />

              <div className="image-label">
                <Image size={14} />
                AI generated media
              </div>

            </div>
          ) : (
            /*
              Shown when:
              - the AI backend did not return an image
                at all (n8n workflow has no image
                generation step / test webhook only
                fires once), OR
              - an imageUrl was returned but failed to
                actually load (see onError above).
              Check the browser console for which case
              this is.
            */
            <div className="generated-image generated-image-empty">
              <Image size={22} />
              <span>
                {imageUrl
                  ? "An image URL was returned, but the image failed to load. Check the browser console for details."
                  : "No image was returned for this post."}
              </span>
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
              disabled={saving}
            >
              <Check size={16} />
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              className="preview-action schedule"
              onClick={onSchedule}
              disabled={saving}
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