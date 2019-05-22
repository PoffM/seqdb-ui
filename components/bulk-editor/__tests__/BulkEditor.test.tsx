import { mount } from "enzyme";
import { act } from "react-test-renderer";
import { BulkEditor, stringColumn } from "..";
import {
  ApiClientContext,
  createContextValue,
  LoadingSpinner
} from "../../../components";
import { OperationsResponse } from "../../../components/api-client/jsonapi-types";

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
    },
    {
      data: {
        attributes: {
          application: "application 2",
          name: "name 2"
        },
        id: 6,
        type: "pcrPrimer"
      },
      status: 201
    },
    {
      data: {
        attributes: {
          application: "application 3",
          name: "name 3"
        },
        id: 7,
        type: "pcrPrimer"
      },
      status: 201
    }
  ] as OperationsResponse
};

const MOCK_ERROR_RESPONSE = {
  data: [
    {
      errors: [
        {
          detail: "name size must be between 1 and 10",
          status: "422",
          title: "Constraint violation"
        }
      ],
      status: 422
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

const COLUMNS = [stringColumn("name"), stringColumn("application")];

function mountWithContext() {
  return mount(
    <ApiClientContext.Provider value={createContextValue()}>
      <BulkEditor
        columns={COLUMNS}
        findPath={id => `pcrPrimer/${id}?include=group,region`}
        ids={[5, 6, 7]}
        patchPath={id => `pcrPrimer/${id}`}
        type="pcrPrimer"
      />
    </ApiClientContext.Provider>
  );
}

describe("BulkEditor component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders initially with a loading indicator.", async () => {
    const wrapper = mountWithContext();
    expect(wrapper.find(LoadingSpinner).exists()).toEqual(true);

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });
  });

  it("Displays the initial data after it finishes loading.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);

    const wrapper = mountWithContext();

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    expect(mockPatch).lastCalledWith(
      expect.anything(),
      [
        {
          op: "GET",
          path: "pcrPrimer/5?include=group,region",
          value: { id: 5, type: "pcrPrimer" }
        },
        {
          op: "GET",
          path: "pcrPrimer/6?include=group,region",
          value: { id: 6, type: "pcrPrimer" }
        },
        {
          op: "GET",
          path: "pcrPrimer/7?include=group,region",
          value: { id: 7, type: "pcrPrimer" }
        }
      ],
      expect.anything()
    );

    expect(wrapper.find(".rt-tr-group").length).toEqual(3);
    expect(wrapper.find("input[name='0.name']").prop("value")).toEqual(
      "name 1"
    );
    expect(wrapper.find("input[name='1.application']").prop("value")).toEqual(
      "application 2"
    );
  });

  it("Submits the changed values only in a bulk operations request.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);
    const wrapper = mountWithContext();

    // Wait for the state update.
    await act(async () => {
      await new Promise(res => setTimeout(res, 5));
      wrapper.update();
    });

    wrapper.find("input[name='0.name']").simulate("change", {
      target: { name: "0.name", value: "new name" }
    });
    wrapper.find("input[name='2.application']").simulate("change", {
      target: { name: "2.application", value: "new application" }
    });

    mockPatch.mockReturnValueOnce({ data: [{}, {}] });
    wrapper.find("form").simulate("submit");

    // Wait for the state update.
    await act(async () => {
      await new Promise(res => setTimeout(res, 5));
      wrapper.update();
    });

    // Only the first and third primers should have been edited,
    // and only the edited attributes should be included in the operations request.
    expect(mockPatch).lastCalledWith(
      expect.anything(),
      [
        {
          op: "PATCH",
          path: "pcrPrimer/5",
          value: {
            attributes: { name: "new name" },
            id: "5",
            type: "pcrPrimer"
          }
        },
        {
          op: "PATCH",
          path: "pcrPrimer/7",
          value: {
            attributes: { application: "new application" },
            id: "7",
            type: "pcrPrimer"
          }
        }
      ],
      expect.anything()
    );
  });

  it("Shows a success message when the bulk edit succeeds.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);
    const wrapper = mountWithContext();

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    wrapper.find("input[name='0.name']").simulate("change", {
      target: { name: "0.name", value: "new name" }
    });

    mockPatch.mockReturnValueOnce({ data: [{ status: 201 }] });
    wrapper.find("form").simulate("submit");

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    expect(wrapper.find(".alert.alert-success").text()).toEqual(
      "1 rows updated."
    );
  });

  it("Shows a error message when the bulk edit fails.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);
    const wrapper = mountWithContext();

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    wrapper.find("input[name='0.name']").simulate("change", {
      target: { name: "0.name", value: "this-name-is-too-long" }
    });

    mockPatch.mockReturnValueOnce(MOCK_ERROR_RESPONSE);
    wrapper.find("form").simulate("submit");

    // Wait for the state update.
    await act(async () => {
      await new Promise(setImmediate);
      wrapper.update();
    });

    expect(wrapper.find(".alert.alert-error").text()).toEqual(
      "Constraint violation: name size must be between 1 and 10"
    );
  });
});
