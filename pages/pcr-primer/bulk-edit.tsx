import { withRouter } from "next/router";
import { Column } from "react-table";
import { BulkEditor } from "../../components/bulk-editor/BulkEditor";
import {
  resourceSelectColumn,
  selectColumn,
  stringColumn
} from "../../components/bulk-editor/columns";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";
import { Region } from "../../types/seqdb-api/resources/Region";
import { filterBy } from "../../util/rsql";

const COLUMNS: Array<Column<PcrPrimer>> = [
  resourceSelectColumn<Region>("region", {
    filter: filterBy(["name"]),
    model: "region",
    optionLabel: region => region.name
  }),
  stringColumn("targetSpecies"),
  stringColumn("name"),
  stringColumn("lotNumber"),
  stringColumn("application"),
  selectColumn("direction", {
    options: [{ label: "F", value: "F" }, { label: "R", value: "R" }]
  }),
  stringColumn("seq"),
  stringColumn("tmCalculated"),
  stringColumn("supplier"),
  stringColumn("purification"),
  stringColumn("reference"),
  stringColumn("designedBy"),
  stringColumn("stockConcentration"),
  stringColumn("note")
];

export default withRouter(({ router }) => (
  <BulkEditor<PcrPrimer>
    columns={COLUMNS}
    findPath={id => `pcrPrimer/${id}?include=group,region`}
    ids={(router.query.ids as string).split(",").map(Number)}
    patchPath={id => `pcrPrimer/${id}`}
    type="pcrPrimer"
  />
));
