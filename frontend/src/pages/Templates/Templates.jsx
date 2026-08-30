import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Sparkles,
  LayoutTemplate,
  Megaphone,
  ShoppingBag,
  CalendarDays,
  Heart,
  Briefcase,
  Copy,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";

import "./Templates.css";

/* =========================================================
   PLATFORM BADGE
   No Facebook / Instagram / LinkedIn / Twitter imports.
   This prevents lucide-react export errors.
========================================================= */

const PlatformBadge = ({ platform, className = "" }) => {
  const badges = {
    Instagram: "IG",
    LinkedIn: "in",
    Twitter: "X",
    Facebook: "f",
  };

  return (
    <span
      className={`platform-badge platform-${platform.toLowerCase()} ${className}`}
      aria-label={platform}
      title={platform}
    >
      {badges[platform] || "•"}
    </span>
  );
};

/* =========================================================
   TEMPLATES
========================================================= */

const templates = [
  {
    id: 1,
    title: "Product Launch",
    description:
      "Announce your new product with an engaging and professional social post.",
    category: "Marketing",
    platform: "Instagram",
    icon: Megaphone,
    gradient: "template-gradient-one",
    content:
      "🚀 Something exciting is here! We're proud to introduce our latest product, designed to make your everyday experience better. Discover what's new today.",
    tags: ["Launch", "Product", "Marketing"],
  },

  {
    id: 2,
    title: "Business Update",
    description:
      "Share an important company update with your audience in a professional tone.",
    category: "Business",
    platform: "LinkedIn",
    icon: Briefcase,
    gradient: "template-gradient-two",
    content:
      "We're excited to share an important update from our team. New opportunities, new ideas, and a stronger focus on delivering meaningful results.",
    tags: ["Business", "Update", "Professional"],
  },

  {
    id: 3,
    title: "Weekend Promotion",
    description:
      "Create a promotional post for limited-time weekend offers.",
    category: "Promotion",
    platform: "Facebook",
    icon: ShoppingBag,
    gradient: "template-gradient-three",
    content:
      "Weekend special is here! 🎉 Enjoy our exclusive offer for a limited time. Don't miss the chance to grab your favorites before the offer ends.",
    tags: ["Sale", "Offer", "Weekend"],
  },

  {
    id: 4,
    title: "Motivational Post",
    description:
      "Inspire your audience with a short and powerful motivational message.",
    category: "Engagement",
    platform: "Instagram",
    icon: Heart,
    gradient: "template-gradient-four",
    content:
      "Small steps every day create big results. Keep learning, keep building, and keep moving forward. Your progress matters.",
    tags: ["Motivation", "Inspiration"],
  },

  {
    id: 5,
    title: "Event Announcement",
    description:
      "Promote an upcoming event, webinar, workshop, or community activity.",
    category: "Events",
    platform: "LinkedIn",
    icon: CalendarDays,
    gradient: "template-gradient-five",
    content:
      "Save the date! 📅 We're hosting an exciting upcoming event where you'll learn, connect, and discover new ideas. More details coming soon.",
    tags: ["Event", "Webinar", "Announcement"],
  },

  {
    id: 6,
    title: "Brand Story",
    description:
      "Tell your audience the story behind your brand and what you stand for.",
    category: "Branding",
    platform: "Instagram",
    icon: Sparkles,
    gradient: "template-gradient-six",
    content:
      "Every great brand starts with an idea. Our journey began with a simple goal: create something meaningful, useful, and built for people.",
    tags: ["Brand", "Story", "Community"],
  },

  {
    id: 7,
    title: "Twitter Announcement",
    description:
      "Create a short announcement optimized for fast-moving social conversations.",
    category: "Marketing",
    platform: "Twitter",
    icon: Sparkles,
    gradient: "template-gradient-seven",
    content:
      "Big things are coming. We're building, improving, and getting ready to share something special with you. Stay tuned.",
    tags: ["Twitter", "Announcement"],
  },

  {
    id: 8,
    title: "Professional Achievement",
    description:
      "Celebrate milestones, achievements, awards, or important professional wins.",
    category: "Business",
    platform: "LinkedIn",
    icon: Briefcase,
    gradient: "template-gradient-eight",
    content:
      "We're proud to celebrate another milestone. This achievement reflects the dedication, creativity, and teamwork behind everything we do.",
    tags: ["Achievement", "Career", "Success"],
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "All Templates",
  "Marketing",
  "Business",
  "Promotion",
  "Engagement",
  "Events",
  "Branding",
];

const platforms = [
  "All Platforms",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "Facebook",
];

/* =========================================================
   COMPONENT
========================================================= */

function Templates() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Templates");
  const [platform, setPlatform] = useState("All Platforms");

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  /* =======================================================
     FILTER TEMPLATES
  ======================================================= */

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        template.title.toLowerCase().includes(searchText) ||
        template.description.toLowerCase().includes(searchText) ||
        template.category.toLowerCase().includes(searchText) ||
        template.platform.toLowerCase().includes(searchText) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchText)
        );

      const matchesCategory =
        category === "All Templates" ||
        template.category === category;

      const matchesPlatform =
        platform === "All Platforms" ||
        template.platform === platform;

      return matchesSearch && matchesCategory && matchesPlatform;
    });
  }, [search, category, platform]);

  /* =======================================================
     USE TEMPLATE
  ======================================================= */

  const handleUseTemplate = (template) => {
    localStorage.setItem(
      "selectedTemplate",
      JSON.stringify(template)
    );

    window.location.href = "/create-post";
  };

  /* =======================================================
     SELECTED TEMPLATE ICON
  ======================================================= */

  const SelectedTemplateIcon = selectedTemplate?.icon;

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="templates-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="templates-header">

        <div className="templates-heading">

          <div className="templates-heading-icon">
            <LayoutTemplate size={24} />
          </div>

          <div>

            <div className="templates-eyebrow">
              CONTENT LIBRARY
            </div>

            <h1>
              Templates<span>.</span>
            </h1>

            <p>
              Start faster with professionally designed social
              media templates.
            </p>

          </div>

        </div>

        <button
          className="create-template-button"
          onClick={() =>
            (window.location.href = "/create-post")
          }
        >
          <Plus size={17} />
          Create New Post
        </button>

      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="templates-stats">

        <div className="template-stat-card active-stat">

          <div className="stat-icon">
            <LayoutTemplate size={19} />
          </div>

          <div>
            <span>Total Templates</span>
            <strong>{templates.length}</strong>
          </div>

        </div>

        <div className="template-stat-card">

          <div className="stat-icon marketing-stat">
            <Megaphone size={19} />
          </div>

          <div>
            <span>Marketing</span>

            <strong>
              {
                templates.filter(
                  (item) => item.category === "Marketing"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="template-stat-card">

          <div className="stat-icon business-stat">
            <Briefcase size={19} />
          </div>

          <div>
            <span>Business</span>

            <strong>
              {
                templates.filter(
                  (item) => item.category === "Business"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="template-stat-card">

          <div className="stat-icon event-stat">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Categories</span>
            <strong>{categories.length - 1}</strong>
          </div>

        </div>

      </div>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="templates-toolbar">

        {/* SEARCH */}

        <div className="templates-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              type="button"
            >
              <X size={15} />
            </button>
          )}

        </div>

        {/* CATEGORY FILTER */}

        <div className="template-filter-wrapper">

          <button
            className="template-filter"
            type="button"
            onClick={() =>
              setShowCategoryMenu(!showCategoryMenu)
            }
          >
            <LayoutTemplate size={16} />

            {category}

            <ChevronDown size={15} />
          </button>

          {showCategoryMenu && (
            <div className="filter-dropdown">

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item ? "selected" : ""
                  }
                  onClick={() => {
                    setCategory(item);
                    setShowCategoryMenu(false);
                  }}
                >
                  {item}
                </button>
              ))}

            </div>
          )}

        </div>

        {/* PLATFORM FILTER */}

        <div className="template-filter-wrapper">

          <button
            className="template-filter"
            type="button"
            onClick={() =>
              setShowPlatformMenu(!showPlatformMenu)
            }
          >

            <Sparkles size={16} />

            {platform}

            <ChevronDown size={15} />

          </button>

          {showPlatformMenu && (
            <div className="filter-dropdown platform-dropdown">

              {platforms.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    platform === item ? "selected" : ""
                  }
                  onClick={() => {
                    setPlatform(item);
                    setShowPlatformMenu(false);
                  }}
                >
                  {item}
                </button>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* ===================================================
          RESULT COUNT
      =================================================== */}

      <div className="templates-result">

        <span>
          {filteredTemplates.length}{" "}
          {filteredTemplates.length === 1
            ? "template"
            : "templates"}{" "}
          found
        </span>

        {(search ||
          category !== "All Templates" ||
          platform !== "All Platforms") && (

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All Templates");
              setPlatform("All Platforms");
            }}
          >
            Clear filters
          </button>

        )}

      </div>

      {/* ===================================================
          TEMPLATES GRID
      =================================================== */}

      {filteredTemplates.length > 0 ? (

        <div className="templates-grid">

          {filteredTemplates.map((template, index) => {

            const Icon = template.icon;

            return (
              <div
                className="template-card"
                key={template.id}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >

                {/* TEMPLATE PREVIEW */}

                <div
                  className={`template-preview ${template.gradient}`}
                >

                  <div className="preview-top">

                    <div className="preview-brand">
                      <Icon size={18} />
                    </div>

                    <div className="preview-platform">

                      <PlatformBadge
                        platform={template.platform}
                      />

                      {template.platform}

                    </div>

                  </div>

                  <div className="preview-content">

                    <div className="preview-small-title">
                      {template.category.toUpperCase()}
                    </div>

                    <h3>{template.title}</h3>

                    <p>{template.content}</p>

                  </div>

                  <div className="preview-lines">
                    <span />
                    <span />
                    <span />
                  </div>

                </div>

                {/* CARD CONTENT */}

                <div className="template-card-content">

                  <div className="template-card-title">

                    <div>

                      <h2>{template.title}</h2>

                      <span>
                        {template.category}
                      </span>

                    </div>

                    <div className="template-card-platform">

                      <PlatformBadge
                        platform={template.platform}
                      />

                    </div>

                  </div>

                  <p>
                    {template.description}
                  </p>

                  <div className="template-tags">

                    {template.tags
                      .slice(0, 3)
                      .map((tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      ))}

                  </div>

                  <div className="template-actions">

                    <button
                      className="preview-button"
                      type="button"
                      onClick={() =>
                        setSelectedTemplate(template)
                      }
                    >
                      <Eye size={15} />
                      Preview
                    </button>

                    <button
                      className="use-template-button"
                      type="button"
                      onClick={() =>
                        handleUseTemplate(template)
                      }
                    >
                      <Sparkles size={15} />
                      Use Template
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        /* =================================================
           EMPTY STATE
        ================================================= */

        <div className="templates-empty">

          <div className="empty-template-icon">
            <Search size={28} />
          </div>

          <h2>No templates found</h2>

          <p>
            Try a different search term or remove some
            filters.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All Templates");
              setPlatform("All Platforms");
            }}
          >
            Reset Filters
          </button>

        </div>

      )}

      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      {selectedTemplate && (

        <div
          className="template-modal-overlay"
          onClick={() => setSelectedTemplate(null)}
        >

          <div
            className="template-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span>
                  Template Preview
                </span>

                <h2>
                  {selectedTemplate.title}
                </h2>

              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setSelectedTemplate(null)
                }
              >
                <X size={19} />
              </button>

            </div>

            {/* MODAL PREVIEW */}

            <div
              className={`modal-preview ${selectedTemplate.gradient}`}
            >

              <div className="modal-preview-top">

                <div className="modal-preview-logo">

                  {SelectedTemplateIcon && (
                    <SelectedTemplateIcon size={21} />
                  )}

                </div>

                <div>

                  <strong>
                    AI Social Manager
                  </strong>

                  <span>
                    {selectedTemplate.platform}
                  </span>

                </div>

              </div>

              <div className="modal-preview-main">

                <small>
                  {selectedTemplate.category.toUpperCase()}
                </small>

                <h3>
                  {selectedTemplate.title}
                </h3>

                <p>
                  {selectedTemplate.content}
                </p>

              </div>

            </div>

            {/* MODAL INFO */}

            <div className="modal-info">

              <div>

                <span>
                  Category
                </span>

                <strong>
                  {selectedTemplate.category}
                </strong>

              </div>

              <div>

                <span>
                  Platform
                </span>

                <strong>

                  <PlatformBadge
                    platform={
                      selectedTemplate.platform
                    }
                  />

                  {selectedTemplate.platform}

                </strong>

              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="modal-actions">

              <button
                className="copy-template-button"
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    selectedTemplate.content
                  )
                }
              >
                <Copy size={15} />
                Copy Content
              </button>

              <button
                className="modal-use-button"
                type="button"
                onClick={() =>
                  handleUseTemplate(selectedTemplate)
                }
              >
                <Sparkles size={15} />
                Use This Template
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Templates;