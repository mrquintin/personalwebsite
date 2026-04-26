// Recent writing, most recent first, capped at 12 entries. The
// resume page conditionally renders this section, so an empty list
// hides it. Each item: title, venue (publication), date, optional href.
export type WritingItem = {
  date: string;
  title: string;
  venue: string;
  href?: string;
};

const writing: WritingItem[] = [];
export default writing;
