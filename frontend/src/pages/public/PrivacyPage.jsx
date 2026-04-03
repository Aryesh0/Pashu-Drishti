export default function PrivacyPage() {
  return (
    <div className="card my-8 sm:my-12">
      <p className="text-sm font-body font-semibold uppercase tracking-[0.2em] text-mustard-600">Privacy</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-earth-900">Privacy and data use</h1>
      <div className="mt-6 space-y-4 font-body text-sm text-earth-600 leading-relaxed">
        <p>
          Pashu Drishti stores operational records for farm registration, animal identification, surveillance activity, treatment
          logging, and authorised audit review. Access is role-based and intended for official livestock management workflows.
        </p>
        <p>
          Data visibility is limited by the permissions assigned to each role. Administrators and authorised officers may review
          records for oversight, while farmers and field teams primarily access the records relevant to their scope of work.
        </p>
        <p>
          Platform activity such as authentication events, record creation, updates, and compliance actions may be logged to support
          accountability, troubleshooting, and programme governance.
        </p>
      </div>
    </div>
  )
}
