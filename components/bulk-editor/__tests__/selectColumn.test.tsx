import { mount } from "enzyme";
import Select from "react-select";
import { act } from "react-test-renderer";
import { ApiClientContext, createContextValue } from "../..";
import { OperationsResponse } from "../../api-client/jsonapi-types";
import { BulkEditor } from "../BulkEditor";
import { selectColumn } from "../selectColumn";

const MOCK_PRIMER_RESPONSE = {
  data: [
    {
      data: {
        attributes: {
          application: "application 1",
          name: "name 1"
        },
        id: 5,
        type: "pcrPrimer"
      },
      status: 201
    }
  ] as OperationsResponse
};

const mockPatch = jest.fn(() => ({ data: [] }));

jest.mock("axios", () => ({
  create() {
    return {
      patch: mockPatch
    };
  }
}));

describe("selectColumn", () => {
  function mountBulkEditor() {
    return mount(
      <ApiClientContext.Provider value={createContextValue()}>
        <BulkEditor
          columns={[
            selectColumn("direction", {
              options: [{ label: "F", value: "F" }, { label: "R", value: "R" }]
            })
          ]}
          findPath={id => `pcrPrimer/${id}?include=group,region`}
          ids={[5, 6, 7]}
          patchPath={id => `pcrPrimer/${id}`}
          type="pcrPrimer"
        />
      </ApiClientContext.Provider>
    );
  }

  it("Changes a formik value.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);

    // Render primer bulk editor.
    const wrapper = mountBulkEditor();

    // Wait for the bulk editor to load.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    const { onChange } = wrapper.find(Select).props();

    // Simulate changing the selected option.
    onChange({
      label: "Fusion Primer",
      value: "FUSION_PRIMER"
    });

    // Submit the form.
    wrapper.find("form").simulate("submit");

    // Wait for the submission to complete.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    // Only the primer direction should have been changed.
    expect(mockPatch).lastCalledWith(
      "operations",
      [
        {
          op: "PATCH",
          path: "pcrPrimer/5",
          value: {
            attributes: { direction: "FUSION_PRIMER" },
            id: "5",
            type: "pcrPrimer"
          }
        }
      ],
      expect.anything()
    );
  });

  it("Sets the dropdown zIndex to 5 for visibility in the bulk edit table.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);

    // Render primer bulk editor.
    const wrapper = mountBulkEditor();

    // Wait for the bulk editor to load.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    expect(
      wrapper
        .find(Select)
        .prop("styles")
        .menu()
    ).toEqual({ zIndex: 5 });
  });
});
