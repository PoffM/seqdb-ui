import { Form, Formik, FormikActions } from "formik";
import { FilterParam } from "kitsu";
import { isEqual } from "lodash";
import { useState } from "react";
import ReactTable from "react-table";
import {
  ColumnDefinition,
  FilterBuilderField,
  Head,
  Nav,
  QueryTable
} from "../../components";
import { rsql } from "../../components/filter-builder/rsql";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";

export default function() {
  const [filter, setFilter] = useState<FilterParam>();
  const [selected, setSelected] = useState([]);

  const PRIMER_COLUMNS: Array<ColumnDefinition<PcrPrimer>> = [
    "name",
    {
      Header: "Group Name",
      accessor: "group.groupName"
    },
    {
      Cell: ({ original }) => (
        <button
          className="btn btn-primary"
          onClick={() => setSelected([...selected, original])}
        >
          -->
        </button>
      ),
      sortable: false
    }
  ];

  function onFilterSubmit(values, { setSubmitting }: FormikActions<any>) {
    setFilter({ rsql: rsql(values.filter) });
    setSubmitting(false);
  }

  return (
    <div>
      <Head title="Primer Selection" />
      <Nav />
      <div className="container-fluid">
        <strong>Filter records:</strong>
        <Formik initialValues={{ filter: null }} onSubmit={onFilterSubmit}>
          <Form>
            <FilterBuilderField filterAttributes={["name"]} name="filter" />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </Form>
        </Formik>
        <div className="row">
          <div className="col-6">
            <QueryTable
              columns={PRIMER_COLUMNS}
              filter={filter}
              include="group"
              path="pcrPrimer"
            />
          </div>
          <div className="col-1" />
          <div className="col-5">
            <ReactTable
              className="-striped"
              columns={[
                { accessor: "name", Header: "Name" },
                { accessor: "group.groupName", Header: "Group Name" },
                {
                  Cell: ({ index }) => (
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        const newSelected = [...selected];
                        newSelected.splice(index, 1);
                        setSelected(newSelected);
                      }}
                    >
                      Remove
                    </button>
                  )
                }
              ]}
              data={selected}
              pageSize={selected.length}
              showPagination={false}
              sortable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}