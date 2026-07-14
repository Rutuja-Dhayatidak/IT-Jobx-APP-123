const { sanitizeFileName } = require("../src/utils/fileNameSanitizer");
const { validatePdfSecurity } = require("../src/services/fileSecurity.service");
const validateUploadedFile = require("../src/middlewares/validateUploadedFile");
const { UploadCategories } = require("../src/constants/upload.constants");

describe("File Upload Security Test Suite", () => {

  describe("Filename Sanitizer (Path Traversal & Double Extension Prevention)", () => {
    test("Should strip path traversal characters from filename", () => {
      const unsafe = "../../../etc/passwd";
      const clean = sanitizeFileName(unsafe);
      expect(clean).toBe("etc-passwd");
    });

    test("Should replace intermediate dots with hyphens to block double extensions", () => {
      const unsafe = "resume.pdf.exe";
      const clean = sanitizeFileName(unsafe);
      expect(clean).toBe("resume-pdf.exe");
    });

    test("Should prevent null bytes and HTML script tags inside filenames", () => {
      const unsafe = "<script>alert(1)</script>\0myfile.pdf";
      const clean = sanitizeFileName(unsafe);
      expect(clean).toBe("myfile.pdf");
    });
  });

  describe("PDF Security Analysis (Script and Launch Checks)", () => {
    test("Should accept a clean PDF buffer", () => {
      const cleanPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj");
      expect(() => validatePdfSecurity(cleanPdf)).not.toThrow();
    });

    test("Should reject PDF containing embedded JavaScript", () => {
      const maliciousPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /JS (alert('XSS')) /JavaScript >>\nendobj");
      expect(() => validatePdfSecurity(maliciousPdf)).toThrow("embedded JavaScript");
    });

    test("Should reject PDF containing launch action command", () => {
      const maliciousPdf = Buffer.from("%PDF-1.4\n/Launch << /F (cmd.exe) >>");
      expect(() => validatePdfSecurity(maliciousPdf)).toThrow("external launch actions");
    });
  });

  describe("Upload Validator Middleware Rules", () => {
    test("Should return 400 FILE_REQUIRED if no file is uploaded", async () => {
      const middleware = validateUploadedFile(UploadCategories.RESUME);
      const req = {};
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        }
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe("FILE_REQUIRED");
      expect(next).not.toHaveBeenCalled();
    });

    test("Should return 400 INVALID_FILE_TYPE if upload field name is unexpected", async () => {
      const middleware = validateUploadedFile(UploadCategories.RESUME);
      const req = {
        file: {
          fieldname: "wrongFieldName",
          size: 1000,
          originalname: "resume.pdf"
        }
      };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        }
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe("INVALID_FILE_TYPE");
    });
  });

});
