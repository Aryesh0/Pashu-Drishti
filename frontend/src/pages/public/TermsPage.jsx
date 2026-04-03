export default function TermsPage() {
  return (
    <div className="card my-8 sm:my-12">
      <p className="text-sm font-body font-semibold uppercase tracking-[0.2em] text-mustard-600">Terms</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-earth-900">Platform terms of use</h1>
      <div className="mt-6 space-y-4 font-body text-sm text-earth-600 leading-relaxed">
        <p>
          This platform is intended for authorised livestock-management workflows, programme monitoring, and operational reporting.
          Users are responsible for entering accurate farm, animal, treatment, and testing information within their approved scope.
        </p>
        <p>
          Role-based permissions must not be bypassed or shared. Access for veterinary officers, district officers, administrators,
          and farmers should correspond to the duties assigned by the operating programme.
        </p>
        <p>
          Compliance actions, residue reports, and treatment records entered in the platform may be used for traceability,
          surveillance review, and administrative follow-up.
        </p>
      </div>
    </div>
  )
}
