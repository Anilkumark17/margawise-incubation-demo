export default function FloatingStepNav({
  prevLabel,
  nextLabel,
  centerLabel,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
}) {
  return (
    <div className="floating-step-nav">
      <button
        type="button"
        className="float-nav-btn"
        onClick={onPrev}
        disabled={prevDisabled}
      >
        ‹ {prevLabel}
      </button>
      <span className="float-nav-center">{centerLabel}</span>
      <button
        type="button"
        className="float-nav-btn"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel} ›
      </button>
    </div>
  )
}
