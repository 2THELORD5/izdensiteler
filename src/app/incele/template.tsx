/**
 * Force a full remount of /incele/* on every navigation so Safari/Next
 * soft-nav cannot leave stacked preview chrome in the DOM.
 */
export default function InceleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
