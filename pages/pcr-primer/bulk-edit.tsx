import { withRouter } from "next/router";
import { Column } from "react-table";
import { BulkEditor } from "../../components/bulk-editor/BulkEditor";
import { stringColumn } from "../../components/bulk-editor/columns";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";

const COLUMNS: Array<Column<PcrPrimer>> = [
  stringColumn("name"),
  stringColumn("application")
];

export default withRouter(({ router }) => (
  <BulkEditor
    columns={COLUMNS}
    findPath={id => `pcrPrimer/${id}?include=group,region`}
    ids={(router.query.ids as string).split(",").map(Number)}
    patchPath={id => `pcrPrimer/${id}`}
    router={router}
    type="pcrPrimer"
  />
));
