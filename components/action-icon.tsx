import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Filter,
  Home,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';

export function ActionIcon({ label }: { label: string }) {
  const value = label.toLowerCase();
  const Icon = /delete|remove|deleting/.test(value)
    ? Trash2
    : /cancel|keep it/.test(value)
      ? X
      : /sign out/.test(value)
        ? LogOut
        : /sign in|account|continue|workspace/.test(value)
          ? LogIn
          : /search/.test(value)
            ? Search
            : /filter/.test(value)
              ? Filter
              : /photo|upload|attach/.test(value)
                ? Upload
                : /download/.test(value)
                  ? Download
                  : /print/.test(value)
                    ? Printer
                    : /retry|try again/.test(value)
                      ? RotateCcw
                      : /edit|manage/.test(value)
                        ? Pencil
                        : /save|update/.test(value)
                          ? Save
                          : /add|create/.test(value)
                            ? Plus
                            : /summary|record/.test(value)
                              ? FileText
                              : /overview|home/.test(value)
                                ? Home
                                : /accounts|members/.test(value)
                                  ? Users
                                  : /complete|done/.test(value)
                                    ? Check
                                    : ArrowRight;
  return <Icon size={16} aria-hidden="true" className="action-icon" />;
}
