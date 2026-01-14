export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>© 2026 TempEd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Support:</span>
            <a
              href="mailto:support@temped.co.za"
              className="text-[#a435f0] hover:text-[#8710d8] font-bold"
            >
              support@temped.co.za
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
