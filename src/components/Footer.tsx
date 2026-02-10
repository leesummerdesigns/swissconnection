import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-secondary border-t border-surface-border mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              The Swiss Connection
            </h3>
            <p className="text-sm text-text-secondary">
              Connecting skilled service providers with people across
              Switzerland.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">Discover</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/search" className="hover:text-text-primary">
                  Find Services
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=haircuts"
                  className="hover:text-text-primary"
                >
                  Haircuts
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=cleaning"
                  className="hover:text-text-primary"
                >
                  House Cleaning
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=sewing"
                  className="hover:text-text-primary"
                >
                  Sewing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">For Providers</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link
                  href="/provider/setup"
                  className="hover:text-text-primary"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/profile/edit" className="hover:text-text-primary">
                  Edit Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/about" className="hover:text-text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-border text-center text-sm text-text-secondary">
          <p>&copy; {new Date().getFullYear()} The Swiss Connection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
