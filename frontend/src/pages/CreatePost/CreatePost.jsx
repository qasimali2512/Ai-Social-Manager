import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  X,
} from "lucide-react";

import PostComposer from "./components/PostComposer";
import AiPreview from "./components/AiPreview";

import "./CreatePost.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

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
  const [sizePreset, setSizePreset] =
    useState("universal");

  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------
  // NEW: template hydration
  //
  // When the user clicks "Use Template" on the
  // Templates page, that page stores the chosen
  // template in localStorage("selectedTemplate") and
  // redirects here. templateNotice just drives the
  // small "Template applied" banner below the header.
  // -----------------------------------------------
  const [templateNotice, setTemplateNotice] =
    useState("");

  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  // -----------------------------------------------
  // track the saved post id so "Schedule Post"
  // and "Save Draft" both operate on the same row
  // instead of creating a fresh post every time.
  // -----------------------------------------------
  const [postId, setPostId] = useState(null);
  const [saving, setSaving] = useState(false);

  // -----------------------------------------------
  // schedule modal state
  // -----------------------------------------------
  const [showScheduleModal, setShowScheduleModal] =
    useState(false);
  const [scheduleValue, setScheduleValue] =
    useState("");
  const [selectedAccountId, setSelectedAccountId] =
    useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] =
    useState("");

  useEffect(() => {
    loadAccounts();
    loadPlatforms();
  }, []);

  /* ============================================
     APPLY A TEMPLATE (from the Templates page)

     Reads the template that "Use Template" stored in
     localStorage, drops it straight into the caption
     preview so it's an actual usable post (editable,
     saveable, schedulable) instead of just a static
     preview card.
  ============================================ */

  useEffect(() => {
    let template = null;

    try {
      const raw = localStorage.getItem(
        "selectedTemplate"
      );

      if (raw) {
        template = JSON.parse(raw);
      }
    } catch {
      template = null;
    }

    // Always clear it so re-visiting /create-post
    // later (without picking a template again) starts
    // from a blank composer.
    localStorage.removeItem("selectedTemplate");

    if (!template || !template.content) {
      return;
    }

    setContent(template.content);

    setTopic(
      template.title ||
        template.category ||
        "Post from template"
    );

    if (template.platform) {
      setPlatform(
        String(template.platform).toLowerCase()
      );
    }

    // This was only ever a local preview card, so
    // there is no real post id yet - Save Draft /
    // Schedule Post below will create a brand new
    // post from this content, same as any other post.
    setPostId(null);

    setTemplateNotice(
      template.title
        ? `"${template.title}" template applied — edit it below, then save or schedule.`
        : "Template applied — edit it below, then save or schedule."
    );
  }, []);

  /* ============================================
     LOAD SOCIAL ACCOUNTS
  ============================================ */

  const loadAccounts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/social-accounts`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const localAccounts = Array.isArray(data)
        ? data
        : data.accounts ||
          data.data ||
          [];

      let remoteZernio = [];
      try {
        const zernioResponse = await fetch(
          `${API_URL}/api/zernio/accounts`,
          { credentials: "include" }
        );
        if (zernioResponse.ok) {
          const zernioData = await zernioResponse.json();
          remoteZernio = (zernioData.accounts || []).map((account) => ({
            id: `zernio:${account._id || account.id}`,
            provider: "zernio",
            zernio_account_id: account._id || account.id,
            platform: account.platform,
            platform_name: account.platform,
            username: account.username,
            display_name: account.displayName || account.username,
            is_active: account.isActive !== false,
          }));
        }
      } catch {
        remoteZernio = [];
      }

      setAccounts([...localAccounts, ...remoteZernio]);
    } catch {
      setAccounts([]);
    }
  };

  /* ============================================
     LOAD PLATFORMS
  ============================================ */

  const loadPlatforms = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/platforms`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const loadedPlatforms = Array.isArray(data)
        ? data
        : data.platforms ||
          data.data ||
          [];

      const hasYoutube = loadedPlatforms.some(
        (item) => String(item?.key || item?.slug || "").toLowerCase() === "youtube"
      );

      setPlatforms(
        hasYoutube
          ? loadedPlatforms
          : [...loadedPlatforms, { id: "youtube", key: "youtube", name: "YouTube" }]
      );
    } catch {
      setPlatforms([]);
    }
  };

  // -----------------------------------------------
  // NEW: connected accounts, enriched with their
  // platform's display name, for the schedule
  // modal dropdown. Only shows active accounts.
  // -----------------------------------------------
  const connectedAccounts = useMemo(() => {
    return (accounts || [])
      .filter(
        (account) => account?.is_active !== false
      )
      .map((account) => {
        const matchedPlatform = (
          platforms || []
        ).find(
          (item) =>
            item?.id === account?.platform_id ||
            String(item?.key || item?.slug || "").toLowerCase() ===
              String(account?.platform || "").toLowerCase()
        );

        const platformName =
          matchedPlatform?.name ||
          matchedPlatform?.label ||
          matchedPlatform?.key ||
          account?.platform ||
          "Platform";

        const handle =
          account?.display_name ||
          account?.username ||
          "";

        return {
          id: account?.id,
          platformId: matchedPlatform?.id || account?.platform_id,
          provider: account?.provider || "direct",
          zernioAccountId: account?.zernio_account_id || null,
          platformKey: account?.platform || matchedPlatform?.key || matchedPlatform?.slug,
          label: handle
            ? `${platformName} — @${handle}`
            : platformName,
        };
      })
      .filter((account) => account.id);
  }, [accounts, platforms]);

  /* ============================================
     IMAGE PRESETS
  ============================================ */

  const presets = {
    universal: {
      label: "Universal",
      width: 1200,
      height: 1200,
      description:
        "Works well across major platforms",
    },

    instagram_square: {
      label: "Instagram Square",
      width: 1080,
      height: 1080,
      description:
        "Optimized for Instagram square posts",
    },

    instagram_portrait: {
      label: "Instagram Portrait",
      width: 1080,
      height: 1350,
      description:
        "Optimized for Instagram portrait posts",
    },

    instagram_story: {
      label: "Instagram Story",
      width: 1080,
      height: 1920,
      description:
        "Optimized for Instagram Stories",
    },

    linkedin: {
      label: "LinkedIn",
      width: 1200,
      height: 627,
      description:
        "Optimized for LinkedIn feed posts",
    },

    facebook: {
      label: "Facebook",
      width: 1200,
      height: 630,
      description:
        "Optimized for Facebook posts",
    },

    twitter: {
      label: "X / Twitter",
      width: 1600,
      height: 900,
      description:
        "Optimized for X / Twitter",
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

  /* ============================================
     GENERATE AI CONTENT
  ============================================ */

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter what you want to post.");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/ai/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            topic: topic.trim(),
            platform: platform || null,
            tone,
            language,
            length,
            include_hashtags: includeHashtags,
            include_emoji: includeEmoji,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const detail =
          data?.detail ||
          data?.message ||
          `AI generation failed (${response.status})`;

        throw new Error(detail);
      }

      const generatedContent =
        data.content ||
        data.caption ||
        data.generated_content ||
        data.post?.content ||
        "";

      if (!generatedContent) {
        throw new Error(
          "AI generated successfully, but no content was returned."
        );
      }

      setContent(generatedContent);

      setHashtags(
        Array.isArray(data.hashtags)
          ? data.hashtags
          : Array.isArray(data.tags)
          ? data.tags
          : []
      );

      setImageUrl(
        data.image_url ||
          data.imageUrl ||
          data.image ||
          data.post?.media?.[0]?.media_url ||
          ""
      );

      // /api/ai/generate already saves the post as a
      // draft in the DB (see backend
      // ai_post_service.save_generated_post). Capture
      // that id so "Schedule Post" / "Save Draft"
      // update THIS row instead of creating a
      // duplicate post.
      const generatedPostId =
        data.post?.id ||
        data.post_id ||
        null;

      setPostId(generatedPostId);
    } catch (err) {
      console.error(
        "AI generation error:",
        err
      );

      setError(
        err?.message ||
          "Could not connect to the AI service."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================
     REGENERATE
  ============================================ */

  const handleRegenerate = () => {
    handleGenerate();
  };

  /* ============================================
     COPY
  ============================================ */

  const handleCopy = async () => {
    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        content
      );
    } catch (err) {
      console.error(
        "Clipboard error:",
        err
      );
    }
  };

  /* ============================================
     SAVE DRAFT (creates OR updates the post)
  ============================================ */

  const handleSaveDraft = async () => {
    if (!content) {
      return null;
    }

    try {
      setError("");
      setSaving(true);

      // If we already have a post (e.g. it was
      // created by /api/ai/generate), update it
      // instead of creating a second row.
      if (postId) {
        const response = await fetch(
          `${API_URL}/api/posts/${postId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              content,
              status: "draft",
            }),
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.detail || "Failed to save draft."
          );
        }

        return postId;
      }

      const response = await fetch(
        `${API_URL}/api/posts/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            content,
            title:
              topic?.trim() ||
              content
                .replace(/\s+/g, " ")
                .slice(0, 60) ||
              "Untitled Post",
            platform: platform || null,
            status: "draft",
            hashtags,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to save draft."
        );
      }

      const newPostId =
        data?.post?.id ||
        data?.id ||
        null;

      if (newPostId) {
        setPostId(newPostId);
      }

      return newPostId;
    } catch (err) {
      console.error(
        "Save draft error:",
        err
      );

      setError(
        err?.message ||
          "Failed to save draft."
      );

      return null;
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
     SCHEDULE
  ============================================ */

  // Opens the schedule modal (with account/platform
  // picker). If the post has not been saved yet, it
  // is saved first so we have an id to schedule
  // against.
  const handleSchedule = async () => {
    if (!content) {
      return;
    }

    setScheduleError("");

    let id = postId;

    if (!id) {
      id = await handleSaveDraft();
    }

    if (!id) {
      setScheduleError(
        "Could not save the post before scheduling."
      );
      setShowScheduleModal(true);
      return;
    }

    // default to "1 hour from now" pre-filled in the input
    const defaultDate = new Date(
      Date.now() + 60 * 60 * 1000
    );

    const offset = defaultDate.getTimezoneOffset();

    const local = new Date(
      defaultDate.getTime() - offset * 60 * 1000
    );

    setScheduleValue(local.toISOString().slice(0, 16));

    // pre-select first connected account, if any
    setSelectedAccountId(
      connectedAccounts[0]?.id || ""
    );

    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!postId || !scheduleValue) {
      return;
    }

    setScheduling(true);
    setScheduleError("");

    try {
      const scheduledIso = new Date(
        scheduleValue
      ).toISOString();

      const chosenAccount = connectedAccounts.find(
        (account) => account.id === selectedAccountId
      );

      // Zernio accounts are virtual frontend accounts, so they do not have
      // a local social_accounts row. Schedule them directly through Zernio.
      if (chosenAccount?.provider === "zernio") {
        const zernioResponse = await fetch(
          `${API_URL}/api/zernio/posts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              account_id: chosenAccount.zernioAccountId,
              platform: chosenAccount.platformKey,
              content,
              media_urls: imageUrl ? [imageUrl] : [],
              scheduled_for: scheduledIso,
              title:
                topic?.trim() ||
                content.replace(/\s+/g, " ").slice(0, 80),
            }),
          }
        );

        let zernioData = {};
        try {
          zernioData = await zernioResponse.json();
        } catch {
          zernioData = {};
        }

        if (!zernioResponse.ok) {
          throw new Error(
            zernioData?.detail ||
              "Zernio could not schedule the post."
          );
        }

        const localResponse = await fetch(
          `${API_URL}/api/posts/${postId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              status: "scheduled",
              scheduled_at: scheduledIso,
            }),
          }
        );

        if (!localResponse.ok) {
          console.warn("Zernio scheduled the post, but local status update failed.");
        }

        setShowScheduleModal(false);
        return;
      }

      // 1) Mark the post itself as scheduled.
      const response = await fetch(
        `${API_URL}/api/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "scheduled",
            scheduled_at: scheduledIso,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to schedule post."
        );
      }

      // 2) If the user picked a connected account,
      // attach the post to that platform/account so
      // it actually knows WHERE to publish.
      if (chosenAccount) {
        const pubResponse = await fetch(
          `${API_URL}/api/posts/${postId}/publications`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              platform_id: chosenAccount.platformId,
              social_account_id: chosenAccount.id,
              scheduled_at: scheduledIso,
            }),
          }
        );

        // A 409 just means this post/platform pair
        // was already linked earlier - not a real
        // failure, so ignore it.
        if (
          !pubResponse.ok &&
          pubResponse.status !== 409
        ) {
          let pubData = {};

          try {
            pubData = await pubResponse.json();
          } catch {
            pubData = {};
          }

          throw new Error(
            pubData?.detail ||
              "Post was scheduled, but could not be linked to the selected account."
          );
        }
      }

      setShowScheduleModal(false);
    } catch (err) {
      console.error(
        "Schedule error:",
        err
      );

      setScheduleError(
        err?.message ||
          "Failed to schedule post."
      );
    } finally {
      setScheduling(false);
    }
  };

  const selectedPreset =
    presets[sizePreset] || {
      label: "Custom",
      width,
      height,
      description:
        "Custom image dimensions",
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
              Generate engaging social content
              with AI, refine it, and save it
              directly to your workspace.
            </p>

          </div>

          <button
            className="view-posts-button"
            onClick={() => {
              window.location.href =
                "/posts";
            }}
          >
            <span>View Posts</span>

            <ArrowUpRight
              size={17}
            />
          </button>

        </section>

        {/* TEMPLATE APPLIED NOTICE */}

        {templateNotice && (
          <div className="template-notice">

            <div className="error-left">

              <span className="template-notice-dot" />

              <div>
                <strong>
                  Template applied
                </strong>

                <span>
                  {templateNotice}
                </span>
              </div>

            </div>

            <button
              onClick={() =>
                setTemplateNotice("")
              }
              aria-label="Dismiss"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="create-error">

            <div className="error-left">

              <span className="error-dot" />

              <div>
                <strong>
                  Generation Error
                </strong>

                <span>
                  {error}
                </span>
              </div>

            </div>

            <button
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* MAIN WORKSPACE */}

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
            includeHashtags={
              includeHashtags
            }
            setIncludeHashtags={
              setIncludeHashtags
            }
            includeEmoji={
              includeEmoji
            }
            setIncludeEmoji={
              setIncludeEmoji
            }
            accounts={accounts}
            platforms={platforms}
            loading={loading}
            onGenerate={handleGenerate}
            width={width}
            height={height}
            setWidth={setWidth}
            setHeight={setHeight}
            sizePreset={sizePreset}
            onPresetChange={
              handlePresetChange
            }
            onWidthChange={
              handleWidthChange
            }
            onHeightChange={
              handleHeightChange
            }
            selectedPreset={
              selectedPreset
            }
          />

          <AiPreview
            content={content}
            imageUrl={imageUrl}
            hashtags={hashtags}
            onContentChange={
              setContent
            }
            onCopy={handleCopy}
            onRegenerate={
              handleRegenerate
            }
            onSaveDraft={
              handleSaveDraft
            }
            onSchedule={
              handleSchedule
            }
            loading={loading}
            saving={saving}
          />

        </section>

      </main>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div
          className="schedule-post-backdrop"
          onClick={() =>
            !scheduling &&
            setShowScheduleModal(false)
          }
        >
          <div
            className="schedule-post-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="schedule-post-header">
              <h2>Schedule this post</h2>
              <button
                onClick={() =>
                  setShowScheduleModal(false)
                }
                disabled={scheduling}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <p className="schedule-post-hint">
              Choose the connected account it should
              publish to, and when.
            </p>

            {scheduleError && (
              <div className="schedule-post-error">
                {scheduleError}
              </div>
            )}

            <div className="schedule-post-field">
              <label>Publish to account</label>

              {connectedAccounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(event) =>
                    setSelectedAccountId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    No specific account (just mark as
                    scheduled)
                  </option>

                  {connectedAccounts.map(
                    (account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.label}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <div className="schedule-post-noaccounts">
                  No connected accounts found. Connect
                  one from the{" "}
                  <a href="/accounts">
                    Accounts
                  </a>{" "}
                  page first, or continue without
                  picking one.
                </div>
              )}
            </div>

            <div className="schedule-post-field">
              <label>Publication date & time</label>

              <input
                type="datetime-local"
                value={scheduleValue}
                onChange={(event) =>
                  setScheduleValue(
                    event.target.value
                  )
                }
                min={new Date(
                  Date.now() -
                    new Date().getTimezoneOffset() *
                      60000
                )
                  .toISOString()
                  .slice(0, 16)}
              />
            </div>

            <div className="schedule-post-actions">
              <button
                className="schedule-post-cancel"
                onClick={() =>
                  setShowScheduleModal(false)
                }
                disabled={scheduling}
              >
                Cancel
              </button>

              <button
                className="schedule-post-confirm"
                onClick={handleConfirmSchedule}
                disabled={
                  scheduling || !scheduleValue
                }
              >
                {scheduling
                  ? "Scheduling..."
                  : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreatePost;