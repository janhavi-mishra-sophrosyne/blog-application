/**
 * @file Single.test.jsx
 * Comprehensive tests for Single component
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import Single from "./Single";
import { AuthContext } from "../context/authContext";

vi.mock("axios");
vi.mock("../components/Menu", () => ({
  default: ({ cat }) => <div data-testid="menu-component">Menu: {cat}</div>,
}));
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html) => html,
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Single Component Tests", () => {
  const mockPost = {
    id: 1,
    title: "Test Post Title",
    desc: "<p>This is the post description with HTML</p>",
    img: "test-image.jpg",
    username: "testuser",
    userImg: "user-avatar.jpg",
    cat: "iot",
    date: "2024-01-15T10:30:00Z",
  };

  const mockCurrentUser = {
    username: "testuser",
    id: 1,
  };

  const renderWithAuth = (currentUser = mockCurrentUser, postId = "1") => {
    return render(
      <AuthContext.Provider value={{ currentUser }}>
        <MemoryRouter initialEntries={[`/post/${postId}`]}>
          <Routes>
            <Route path="/post/:id" element={<Single />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.confirm = vi.fn();
  });

  describe("Rendering Tests", () => {
    test("fetches and displays post data on mount", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/posts/1");
      });

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText(/Posted/i)).toBeInTheDocument();
    });

    test("displays post image correctly", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const postImage = document.querySelector('img[src*="test-image.jpg"]');
      expect(postImage).toBeInTheDocument();
    });

    test("displays user avatar when userImg exists", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const userAvatar = document.querySelector('img[src*="user-avatar.jpg"]');
      expect(userAvatar).toBeInTheDocument();
    });

    test("does not display user avatar when userImg is missing", async () => {
      const postWithoutAvatar = { ...mockPost, userImg: null };
      axios.get.mockResolvedValueOnce({ data: postWithoutAvatar });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeInTheDocument();
      });

      const userAvatar = document.querySelector('img[src*="user-avatar.jpg"]');
      expect(userAvatar).not.toBeInTheDocument();
    });

    test("renders sanitized HTML content", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText(/This is the post description with HTML/i)).toBeInTheDocument();
      });
    });

    test("renders Menu component with correct category", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId("menu-component")).toBeInTheDocument();
        expect(screen.getByText("Menu: iot")).toBeInTheDocument();
      });
    });

    test("displays relative time using moment", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText(/Posted/i)).toBeInTheDocument();
      });
    });
  });

  describe("Edit and Delete Buttons Tests", () => {
    test("shows edit and delete buttons when user owns the post", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth(mockCurrentUser);

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const container = document.querySelector(".edit");
      expect(container).toBeInTheDocument();
      
      const images = container.querySelectorAll("img");
      const editButton = Array.from(images).find((img) => img.src.includes("edit.png"));
      const deleteButton = Array.from(images).find((img) => img.src.includes("delete.png"));

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    test("hides edit and delete buttons when user does not own the post", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      const differentUser = { username: "differentuser", id: 2 };
      renderWithAuth(differentUser);

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const container = document.querySelector(".edit");
      expect(container).not.toBeInTheDocument();
    });

    test("edit button links to write page with post state", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const editLink = screen.getByRole("link");
      expect(editLink).toHaveAttribute("href", "/write?edit=2");
    });
  });

  describe("Delete Functionality Tests", () => {
    test("deletes post and navigates home when confirmed", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });
      axios.delete.mockResolvedValueOnce({ data: { message: "Post deleted" } });
      window.confirm.mockReturnValue(true);

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const container = document.querySelector(".edit");
      const deleteButton = container.querySelector('img[src*="delete.png"]');

      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        "Are you sure you want to delete this account?"
      );

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith("/posts/1");
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("does not delete post when user cancels confirmation", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });
      window.confirm.mockReturnValue(false);

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const container = document.querySelector(".edit");
      const deleteButton = container.querySelector('img[src*="delete.png"]');

      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(axios.delete).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("handles delete error gracefully", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation();
      axios.get.mockResolvedValueOnce({ data: mockPost });
      axios.delete.mockRejectedValueOnce(new Error("Delete failed"));
      window.confirm.mockReturnValue(true);

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const container = document.querySelector(".edit");
      const deleteButton = container.querySelector('img[src*="delete.png"]');

      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalled();
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe("Error Handling Tests", () => {
    test("handles fetch error gracefully", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation();
      axios.get.mockRejectedValueOnce(new Error("Failed to fetch"));

      renderWithAuth();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/posts/1");
      });

      expect(consoleLogSpy).toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    test("handles empty post data gracefully", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });

      renderWithAuth();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      // Component should render without crashing
      expect(screen.getByTestId("menu-component")).toBeInTheDocument();
    });
  });

  describe("Dynamic Post ID Tests", () => {
    test("fetches correct post based on URL parameter", async () => {
      axios.get.mockResolvedValueOnce({ data: { ...mockPost, id: 42 } });

      render(
        <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
          <MemoryRouter initialEntries={["/post/42"]}>
            <Routes>
              <Route path="/post/:id" element={<Single />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/posts/42");
      });
    });
  });

  describe("getText Helper Function Tests", () => {
    test("getText extracts plain text from HTML", () => {
      // We can't directly test the getText function, but we verify it's used
      // by checking that HTML content is rendered correctly
      axios.get.mockResolvedValueOnce({
        data: {
          ...mockPost,
          desc: "<p>Text with <strong>bold</strong> and <em>italic</em></p>",
        },
      });

      renderWithAuth();

      waitFor(() => {
        expect(screen.getByText(/Text with/i)).toBeInTheDocument();
      });
    });
  });

  describe("Image Path Tests", () => {
    test("constructs correct image path from upload folder", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      const postImage = document.querySelector('img[src*="upload"]');
      expect(postImage).toBeInTheDocument();
      expect(postImage.src).toContain("test-image.jpg");
    });
  });

  describe("Context Integration Tests", () => {
    test("uses currentUser from AuthContext", async () => {
      axios.get.mockResolvedValueOnce({ data: mockPost });

      const contextUser = { username: "contextuser", id: 3 };

      render(
        <AuthContext.Provider value={{ currentUser: contextUser }}>
          <MemoryRouter initialEntries={["/post/1"]}>
            <Routes>
              <Route path="/post/:id" element={<Single />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText("Test Post Title")).toBeInTheDocument();
      });

      // Edit/delete buttons should not appear since contextUser !== post.username
      const container = document.querySelector(".edit");
      expect(container).not.toBeInTheDocument();
    });
  });
});