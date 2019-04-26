import { Form, Formik, FormikActions } from "formik";
import { KitsuResource } from "kitsu";
import { deserialise } from "kitsu-core";
import { isEqual, isObject, transform } from "lodash";
import { useContext, useEffect, useState } from "react";
import ReactTable, { Column } from "react-table";
import {
  ApiClientContext,
  LoadingSpinner,
  SubmitButton
} from "../../components/";
import { Operation } from "../../components/api-client/jsonapi-types";
import { serialize } from "../../util/serialize";

interface BulkEditorProps<TData> {
  columns: Array<Column<TData>>;
  findPath: (id: number | string) => string;
  ids: number[];
  patchPath: (id: number | string) => string;
  type: string;
}

interface Status {
  message: string;
  type: "success" | "error";
}

export function BulkEditor<TData extends KitsuResource>({
  columns,
  findPath,
  ids,
  patchPath,
  type
}: BulkEditorProps<TData>) {
  const { doOperations } = useContext(ApiClientContext);

  const [initialRows, setInitialRows] = useState<KitsuResource[]>([]);
  const [status, setStatus] = useState<Status>();

  useEffect(() => {
    async function getData() {
      const operations = ids.map<Operation>(id => ({
        op: "GET",
        path: findPath(id),
        value: {
          id,
          type
        }
      }));
      const responses = await doOperations(operations);

      const responseResources = (await Promise.all(
        responses.map(deserialise)
      )).map(res => res.data);

      setInitialRows(responseResources);
    }
    getData();
  }, [ids]);

  async function onSubmit(
    submittedValues: any[],
    { setSubmitting }: FormikActions<KitsuResource[]>
  ) {
    const diffs: Array<Partial<TData>> = Object.values(
      difference(submittedValues, initialRows)
    );

    const serializedDiffs = await Promise.all(
      diffs.map(diff => serialize({ resource: diff, type }))
    );

    const operations = serializedDiffs.map<Operation>(diff => ({
      op: "PATCH",
      path: patchPath(diff.id),
      value: diff
    }));

    try {
      const responses = await doOperations(operations);
      setStatus({
        message: `${responses.length} rows updated.`,
        type: "success"
      });
    } catch (error) {
      setStatus({
        message: error.message,
        type: "error"
      });
      setSubmitting(false);
    }
    setSubmitting(false);
  }

  if (!initialRows.length) {
    return <LoadingSpinner loading={true} />;
  }

  if (status && status.type === "success") {
    return (
      <div className="alert alert-success">
        <span>{status.message}</span>
      </div>
    );
  }

  return (
    <Formik initialValues={initialRows} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form>
          {status && status.type === "error" && (
            <div className="alert alert-error">{status.message}</div>
          )}
          <ReactTable
            columns={columns}
            data={initialRows}
            showPaginationBottom={false}
            loading={isSubmitting}
            manual={true}
            pageSize={initialRows.length}
            sortable={false}
          />
          <SubmitButton />
        </Form>
      )}
    </Formik>
  );
}

/** Returns the difference between two objects, but includes each object's type and ID. */
function difference(object, base) {
  function changes(object, base) {
    return transform(object, (result, value, key: any) => {
      if (!isEqual(value, base[key]) || ["id", "type"].includes(key)) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  }
  return changes(object, base);
}
