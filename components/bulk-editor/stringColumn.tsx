import { FastField, FastFieldProps } from "formik";
import { Column } from "react-table";
import titleCase from "title-case";

export function stringColumn(accessor: string): Column {
  return {
    Cell: ({ index }) => (
      <FastField name={`${index}.${accessor}`}>
        {({
          field: { name, value },
          form: { setFieldValue, setFieldTouched }
        }: FastFieldProps) => {
          function onChange(event) {
            setFieldValue(name, event.target.value);
            setFieldTouched(name);
          }

          // The default Field component's inner text input needs to be replaced with our own
          // controlled input that we manually pass the "onChange" and "value" props. Otherwise
          // we will get React's warning about switching from an uncontrolled to controlled input.
          return (
            <input
              className="form-control"
              name={name}
              onChange={onChange}
              type="text"
              value={value || ""}
            />
          );
        }}
      </FastField>
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}
