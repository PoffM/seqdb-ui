import { FastField, FastFieldProps } from "formik";
import Select from "react-select";
import { Column } from "react-table";
import titleCase from "title-case";

interface SelectColumnParams {
  options: Array<{ label: string; value: any }>;
}

export function selectColumn(
  accessor: string,
  { options }: SelectColumnParams
): Column {
  return {
    Cell: ({ index }) => (
      <FastField name={`${index}.${accessor}`}>
        {({
          field: { name, value },
          form: { setFieldTouched, setFieldValue }
        }: FastFieldProps) => {
          function onChange({ value: selectValue }) {
            setFieldValue(name, selectValue);
            setFieldTouched(name);
          }

          return (
            <Select
              styles={{ menu: () => ({ zIndex: 5 }) }}
              options={options}
              onChange={onChange as any}
              value={options.find(option => option.value === value)}
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
