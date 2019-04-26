import { mount } from "enzyme";
import { ApiClientContext, createContextValue } from "../../../components";
import { PcrPrimerListPage } from "../../../pages/pcr-primer/list";
import { PcrPrimer } from "../../../types/seqdb-api/resources/PcrPrimer";

// Mock out the Link component, which normally fails when used outside of a Next app.
jest.mock("next/link", () => ({ children }) => <div>{children}</div>);

const TEST_PRIMERS: PcrPrimer[] = [
  {
    group: { id: "1", groupName: "Test Group", type: "group" },
    id: "4",
    lotNumber: 1,
    name: "Test Primer 1",
    seq: "test seq",
    type: "PRIMER"
  },
  {
    group: { id: "1", groupName: "Test Group", type: "group" },
    id: "5",
    lotNumber: 1,
    name: "Test Primer 2",
    seq: "test seq",
    type: "PRIMER"
  }
];

/** Mock Kitsu "get" method. */
const mockGet = jest.fn(async () => {
  return {
    data: TEST_PRIMERS
  };
});

// Mock Kitsu, the client class that talks to the backend.
jest.mock(
  "kitsu",
  () =>
    class {
      public get = mockGet;
    }
);

describe("PcrPrimer list page", () => {
  function mountWithContext(element: JSX.Element) {
    return mount(
      <ApiClientContext.Provider value={createContextValue()}>
        {element}
      </ApiClientContext.Provider>
    );
  }

  it("Renders the list page.", async () => {
    const wrapper = mountWithContext(<PcrPrimerListPage />);

    await Promise.resolve();
    wrapper.update();

    // Check that the table contains the links to primer details pages.
    expect(wrapper.containsMatchingElement(<a>Test Primer 1</a>)).toEqual(true);
    expect(wrapper.containsMatchingElement(<a>Test Primer 2</a>)).toEqual(true);
  });

  it("Has a button that takes you to the bulk edit page.", async () => {
    const mockPush = jest.fn();

    const wrapper = mountWithContext(
      <PcrPrimerListPage router={{ push: mockPush } as any} />
    );

    await Promise.resolve();
    wrapper.update();

    wrapper.find("button[children='Bulk Edit']").simulate("click");

    expect(mockPush).lastCalledWith({
      pathname: "/pcr-primer/bulk-edit",
      query: {
        ids: "4,5"
      }
    });
  });
});
