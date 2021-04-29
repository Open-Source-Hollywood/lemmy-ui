import { Component } from "inferno";
import { Link } from "inferno-router";
import { i18n } from "../i18next";
import { GetSiteResponse } from "lemmy-js-client";
import { VERSION } from "../version";

interface FooterProps {
  site: GetSiteResponse;
}

export class Footer extends Component<FooterProps, any> {
  constructor(props: any, context: any) {
    super(props, context);
  }

  render() {
    return (
      <nav class="container navbar navbar-expand-md navbar-light navbar-bg p-3">
        <div className="navbar-collapse">
          <ul class="navbar-nav ml-auto">
            {this.props.site.version !== VERSION && (
              <li class="nav-item">
                <span class="nav-link">UI: {VERSION}</span>
              </li>
            )}
            <li class="nav-item">
              <span class="nav-link">BE: {this.props.site.version}</span>
            </li>
            <li class="nav-item">
              <span class="nav-link">Open Source Hollywood</span>
            </li>

          </ul>
        </div>
      </nav>
    );
  }
}
