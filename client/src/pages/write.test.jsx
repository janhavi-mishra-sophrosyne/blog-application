/**
 * @file Write.test.jsx
 * Comprehensive tests for Write component
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import Write from "./Write";

vi.mock("axios");
vi.mock("react-quill", () => ({
  default: ({ value, onChange }) => (
    <div data-testid="quill-editor">
      <div
        className="ql-editor"
        contentEditable
        onInput={(e) => onChange(e.target.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  ),
}));

// Mock createObjectURL to avoid jsdom crash
beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "mocked-url");
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Write Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    test("renders write form with all elements", () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText(/Title/i)).toBeInTheDocument();
      expect(screen.getByTestId("quill-editor")).toBeInTheDocument();
      expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Publish/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Save as a draft/i })).toBeInTheDocument();
    });

    test("renders all category radio buttons", () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/IoT & Connectivity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Edge AI/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Technology/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/HealthTech/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Electronics/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Software & Cloud/i)).toBeInTheDocument();
    });

    test("displays publish section headers", () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      expect(screen.getByText(/Status:/i)).toBeInTheDocument();
      expect(screen.getByText(/Visibility:/i)).toBeInTheDocument();
      // Note: "Draft" and "Public" appear multiple times, so we just check Status/Visibility exist
    });
  });

  describe("Validation Tests", () => {
    test("shows validation error when title is empty", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    test("shows validation error when title exceeds 100 characters", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const titleInput = screen.getByPlaceholderText(/Title/i);
      fireEvent.change(titleInput, {
        target: { value: "a".repeat(101) },
      });

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Title cannot exceed 100 characters/i)).toBeInTheDocument();
      });
    });

    test("shows validation error when image is not uploaded", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Image is required/i)).toBeInTheDocument();
      });
    });

    test("shows validation error when category is not selected", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Please select a category/i)).toBeInTheDocument();
      });
    });

    test("shows validation error when description is empty", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
      });
    });

    test("shows validation error when description exceeds 10000 characters", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, {
        target: { innerHTML: "a".repeat(10001) },
      });

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Description cannot exceed 10,000 characters/i)).toBeInTheDocument();
      });
    });

    test("clears validation errors when user corrects input", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Title/i);
      fireEvent.change(titleInput, { target: { value: "New Title" } });

      expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument();
    });
  });

  describe("File Upload Tests", () => {
    test("uploads file and displays preview", async () => {
      const file = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText(/Preview/i)).toBeInTheDocument();
        expect(screen.getByText("test.png")).toBeInTheDocument();
      });
    });

    test("clears file validation error after upload", async () => {
      const file = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Image is required/i)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText(/Image is required/i)).not.toBeInTheDocument();
    });
  });

  describe("Category Selection Tests", () => {
    test("selects a category and clears validation error", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Please select a category/i)).toBeInTheDocument();
      });

      const iotRadio = screen.getByLabelText(/IoT & Connectivity/i);
      fireEvent.click(iotRadio);

      expect(screen.queryByText(/Please select a category/i)).not.toBeInTheDocument();
      expect(iotRadio).toBeChecked();
    });

    test("allows switching between categories", () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const iotRadio = screen.getByLabelText(/IoT & Connectivity/i);
      const edgeAiRadio = screen.getByLabelText(/Edge AI/i);

      fireEvent.click(iotRadio);
      expect(iotRadio).toBeChecked();

      fireEvent.click(edgeAiRadio);
      expect(edgeAiRadio).toBeChecked();
      expect(iotRadio).not.toBeChecked();
    });
  });

  describe("Form Submission Tests", () => {
    test("submits new post successfully with all required fields", async () => {
      axios.post.mockResolvedValueOnce({ data: "uploaded-image.jpg" });
      axios.post.mockResolvedValueOnce({ data: { message: "Post created" } });

      const file = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      // Fill title
      fireEvent.change(screen.getByPlaceholderText(/Title/i), {
        target: { value: "My Test Post" },
      });

      // Fill description
      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, {
        target: { innerHTML: "This is my test content" },
      });

      // Upload file
      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Select category
      fireEvent.click(screen.getByLabelText(/IoT & Connectivity/i));

      // Submit form
      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/upload", expect.any(FormData));
      });

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/posts/", expect.objectContaining({
          title: "My Test Post",
          desc: "This is my test content",
          cat: "iot",
          img: "uploaded-image.jpg",
        }));
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("handles upload error gracefully", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation();
      axios.post.mockRejectedValueOnce(new Error("Upload failed"));

      const file = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Title/i), {
        target: { value: "Test" },
      });

      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, { target: { innerHTML: "Content" } });

      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      fireEvent.click(screen.getByLabelText(/IoT & Connectivity/i));

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      });

      // Verify error was logged
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    test("handles post creation error gracefully", async () => {
      axios.post.mockResolvedValueOnce({ data: "uploaded-image.jpg" });
      axios.post.mockRejectedValueOnce(new Error("Post creation failed"));

      const file = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Title/i), {
        target: { value: "Test" },
      });

      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, { target: { innerHTML: "Content" } });

      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      fireEvent.click(screen.getByLabelText(/IoT & Connectivity/i));

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(2);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Edit Mode Tests", () => {
    test("loads existing post data in edit mode", () => {
      const existingPost = {
        id: 1,
        title: "Existing Post",
        desc: "Existing content",
        cat: "iot",
        img: "existing-image.jpg",
      };

      render(
        <MemoryRouter initialEntries={[{ pathname: "/write", state: existingPost }]}>
          <Routes>
            <Route path="/write" element={<Write />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText(/Title/i)).toHaveValue("Existing Post");
      expect(screen.getByLabelText(/IoT & Connectivity/i)).toBeChecked();
    });

    test("updates existing post successfully", async () => {
      const existingPost = {
        id: 1,
        title: "Existing Post",
        desc: "Existing content",
        cat: "iot",
        img: "existing-image.jpg",
      };

      axios.put.mockResolvedValueOnce({ data: { message: "Post updated" } });

      render(
        <MemoryRouter initialEntries={[{ pathname: "/write", state: existingPost }]}>
          <Routes>
            <Route path="/write" element={<Write />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Title/i), {
        target: { value: "Updated Title" },
      });

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/posts/1", expect.objectContaining({
          title: "Updated Title",
          desc: "Existing content",
          cat: "iot",
        }));
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("does not require image upload in edit mode", async () => {
      const existingPost = {
        id: 1,
        title: "Existing Post",
        desc: "Existing content",
        cat: "iot",
        img: "existing-image.jpg",
      };

      axios.put.mockResolvedValueOnce({ data: { message: "Post updated" } });

      render(
        <MemoryRouter initialEntries={[{ pathname: "/write", state: existingPost }]}>
          <Routes>
            <Route path="/write" element={<Write />} />
          </Routes>
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalled();
      });

      // Should not show image required error
      expect(screen.queryByText(/Image is required/i)).not.toBeInTheDocument();
    });
  });

  describe("Editor Tests", () => {
    test("updates description value when typing in editor", () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, {
        target: { innerHTML: "New content" },
      });

      expect(editor.innerHTML).toBe("New content");
    });

    test("clears description validation error when typing", async () => {
      render(
        <MemoryRouter>
          <Write />
        </MemoryRouter>
      );

      const publishButton = screen.getByRole("button", { name: /Publish/i });
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
      });

      const editor = document.querySelector(".ql-editor");
      fireEvent.input(editor, {
        target: { innerHTML: "Some content" },
      });

      expect(screen.queryByText(/Description is required/i)).not.toBeInTheDocument();
    });
  });
});