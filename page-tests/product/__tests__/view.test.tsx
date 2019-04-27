import { mount, shallow } from "enzyme";
import { ApiClientContext, createContextValue } from "../../../components";
import { ProductDetailsPage } from "../../../pages/product/view";
import { Product } from "../../../types/seqdb-api/resources/Product";
import { I18nextProvider } from "react-i18next"
import i18next from "i18next";

// Mock out the Link component, which normally fails when used outside of a Next app.
jest.mock("next/link", () => () => <div />);

const TEST_PRODUCT: Product = {
  group: { id: "1", groupName: "Test Group", type: "group" },
  id: "4",
  name: "Test Product 1",
  type: "product"
};

/** Mock Kitsu "get" method. */
const mockGet = jest.fn(async () => {
  return {
    data: TEST_PRODUCT
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

describe("Product details page", () => {
  function mountWithContext(element: JSX.Element) {
    return mount(
      <I18nextProvider i18n={i18next} >
        <ApiClientContext.Provider value={createContextValue()}>
          {element}
        </ApiClientContext.Provider>
      </I18nextProvider>
    );
  }

  it("getInitialProps called, correct props set after page renders.", async () => {
    await ProductDetailsPage.getInitialProps()
    const wrapper = shallow(<ProductDetailsPage router={{ query: { id: "100" } } as any} />)
    wrapper.update();
    expect(wrapper.find('n[ns="product"]').exists())
  })

  it("Renders initially with a loading spinner.", () => {
    const wrapper = mountWithContext(
      <ProductDetailsPage router={{ query: { id: "100" } } as any} />
    );

    expect(wrapper.find(".spinner-border").exists()).toEqual(true);
  });

  it("Render the Product details", async () => {
    const wrapper = mountWithContext(
      <ProductDetailsPage router={{ query: { id: "100" } } as any} />
    );

    // Wait for the page to load.
    await Promise.resolve();
    wrapper.update();

    expect(wrapper.find(".spinner-border").exists()).toEqual(false);
    // The product's name should be rendered in a FieldView.
    expect(
      wrapper.containsMatchingElement(
        <strong>Name</strong>
      )
    ).toEqual(true);
    expect(
      wrapper.containsMatchingElement(
        <p>Test Product 1</p>
      )
    ).toEqual(true);
  });
});