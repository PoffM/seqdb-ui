import { mount } from "enzyme";
import { ApiClientContext, createContextValue } from "../../../components";
import { OperationsResponse } from "../../../components/api-client/jsonapi-types";
import PcrPrimerBulkEditPage from "../../../pages/pcr-primer/bulk-edit";

const mockRouter = { query: { ids: "3,4,5" } };

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

jest.mock("next/router", () => ({
  withRouter: Component => () => <Component router={mockRouter} />
}));

describe("Pcr Primer bulk edit page", () => {
  function mountWithContext() {
    return mount(
      <ApiClientContext.Provider value={createContextValue()}>
        <PcrPrimerBulkEditPage />
      </ApiClientContext.Provider>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders the primer bulk editor.", () => {
    mountWithContext();

    expect(mockPatch).lastCalledWith(
      expect.anything(),
      [
        {
          op: "GET",
          path: "pcrPrimer/3?include=group,region",
          value: { id: 3, type: "pcrPrimer" }
        },
        {
          op: "GET",
          path: "pcrPrimer/4?include=group,region",
          value: { id: 4, type: "pcrPrimer" }
        },
        {
          op: "GET",
          path: "pcrPrimer/5?include=group,region",
          value: { id: 5, type: "pcrPrimer" }
        }
      ],
      expect.anything()
    );
  });

  it("Submits a bulk patch request.", async () => {
    mockPatch.mockReturnValueOnce(MOCK_PRIMER_RESPONSE);
    const wrapper = mountWithContext();

    await new Promise(res => setTimeout(res, 5));
    wrapper.update();

    // Edit a note field
    wrapper.find("input[name='0.note']").simulate("change", {
      target: { name: "0.note", value: "new note" }
    });

    // Submit the form.
    wrapper.find("form").simulate("submit");

    await new Promise(res => setTimeout(res, 5));
    wrapper.update();

    // The new note value is patched here.
    expect(mockPatch).lastCalledWith(
      expect.anything(),
      [
        {
          op: "PATCH",
          path: "pcrPrimer/5",
          value: {
            attributes: {
              note: "new note"
            },
            id: "5",
            type: "pcrPrimer"
          }
        }
      ],
      expect.anything()
    );
  });
});
