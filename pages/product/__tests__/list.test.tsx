import { mount } from "enzyme";
import { ApiClientContext, createContextValue } from "../../../components";
import { Product } from "../../../types/seqdb-api/resources/Product";
import ProductListPage from "../list";
import { I18nextProvider } from "react-i18next"
import i18next from "i18next";

jest.mock("next/link", () => ({ children }) => <div>{children}</div>);

const TEST_PRODUCTS: Product[] = [
  {
    group: { id: "1", groupName: "Test Group", type: "group" },
    id: "4",
    name: "Test Product 1",
    type: "PRODUCT"
  },
  {
    group: { id: "2", groupName: "Test Group", type: "group" },
    id: "5",
    name: "Test Product 2",
    type: "PRODUCT"
  }
];

/** Mock Kitsu "get" method. */
const mockGet = jest.fn(async () => {
  return {
    data: TEST_PRODUCTS
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

describe("Product list page", () => {
  function mountWithContext(element: JSX.Element) {
    return mount(
      <I18nextProvider i18n={i18next} >
        <ApiClientContext.Provider value={createContextValue()}>
          {element}
        </ApiClientContext.Provider>
      </I18nextProvider>
    );
  }

  it("Renders the list page.", async () => {
    const wrapper = mountWithContext(<ProductListPage />);
    await new Promise(resolve => setTimeout(resolve, 3000));
    wrapper.update();
    expect(wrapper.containsMatchingElement(<a>Test Product 1</a>)).toEqual(true);
    expect(wrapper.containsMatchingElement(<a>Test Product 2</a>)).toEqual(true);
  }
  )

});
