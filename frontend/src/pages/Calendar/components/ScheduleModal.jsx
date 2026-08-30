import {
  CalendarClock,
  Check,
  Clock3,
  X,
} from "lucide-react";

function getTitle(post) {
  return (
    post?.title ||
    post?.content
      ?.split("\n")[0]
      ?.slice(0, 60) ||
    "Scheduled Post"
  );
}

function getMinDateTime() {
  const now = new Date();

  const offset =
    now.getTimezoneOffset();

  const local = new Date(
    now.getTime() -
      offset * 60 * 1000
  );

  return local
    .toISOString()
    .slice(0, 16);
}

function ScheduleModal({
  value,
  setValue,
  post,
  saving,
  onClose,
  onSave,
}) {
  return (
    <div
      className="schedule-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="schedule-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="schedule-modal-header">
          <div className="schedule-title-wrap">
            <div className="schedule-icon">
              <CalendarClock
                size={19}
              />
            </div>

            <div>
              <span>
                SCHEDULING
              </span>

              <h2>
                Reschedule Post
              </h2>

              <p>
                Choose a new date and
                time for this post.
              </p>
            </div>
          </div>

          <button
            className="schedule-close"
            onClick={onClose}
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>

        <div className="schedule-post-preview">
          <div className="schedule-preview-icon">
            <Clock3 size={16} />
          </div>

          <div>
            <span>
              POST
            </span>

            <strong>
              {getTitle(post)}
            </strong>
          </div>
        </div>

        <div className="schedule-field">
          <label>
            Publication date & time
          </label>

          <input
            type="datetime-local"
            value={value}
            min={getMinDateTime()}
            onChange={(event) =>
              setValue(
                event.target.value
              )
            }
          />

          <span className="schedule-hint">
            Select a future date and
            time.
          </span>
        </div>

        <div className="schedule-actions">
          <button
            className="schedule-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="schedule-save"
            onClick={onSave}
            disabled={
              saving || !value
            }
          >
            {saving ? (
              <>
                <span className="mini-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;