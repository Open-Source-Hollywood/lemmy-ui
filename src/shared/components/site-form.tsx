import { Component, linkEvent } from "inferno";
import { Prompt } from "inferno-router";
import { MarkdownTextArea } from "./markdown-textarea";
import { Spinner } from "./icon";
import { ImageUploadForm } from "./image-upload-form";
import { Site, EditSite, CreateSite } from "lemmy-js-client";
import { WebSocketService } from "../services";
import {
  authField,
  capitalizeFirstLetter,
  randomStr,
  wsClient,
} from "../utils";
import { i18n } from "../i18next";

interface SiteFormProps {
  site?: Site; // If a site is given, that means this is an edit
  onCancel?(): any;
}

interface SiteFormState {
  siteForm: EditSite;
  loading: boolean;
}

export class SiteForm extends Component<SiteFormProps, SiteFormState> {
  private id = `site-form-${randomStr()}`;
  private emptyState: SiteFormState = {
    siteForm: {
      enable_downvotes: true,
      open_registration: true,
      enable_nsfw: true,
      name: null,
      icon: null,
      banner: null,
      auth: authField(),
    },
    loading: false,
  };

  constructor(props: any, context: any) {
    super(props, context);

    this.state = this.emptyState;
    this.handleSiteSidebarChange = this.handleSiteSidebarChange.bind(this);

    this.handleIconUpload = this.handleIconUpload.bind(this);
    this.handleIconRemove = this.handleIconRemove.bind(this);

    this.handleBannerUpload = this.handleBannerUpload.bind(this);
    this.handleBannerRemove = this.handleBannerRemove.bind(this);

    if (this.props.site) {
      this.state.siteForm = {
        name: this.props.site.name,
        sidebar: this.props.site.sidebar,
        description: this.props.site.description,
        enable_downvotes: this.props.site.enable_downvotes,
        open_registration: this.props.site.open_registration,
        enable_nsfw: this.props.site.enable_nsfw,
        community_creation_admin_only: this.props.site
          .community_creation_admin_only,
        icon: this.props.site.icon,
        banner: this.props.site.banner,
        auth: authField(),
      };
    }
  }

  // Necessary to stop the loading
  componentWillReceiveProps() {
    this.state.loading = false;
    this.setState(this.state);
  }

  componentDidUpdate() {
    if (
      !this.state.loading &&
      !this.props.site &&
      (this.state.siteForm.name ||
        this.state.siteForm.sidebar ||
        this.state.siteForm.description)
    ) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  }

  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  render() {
    return (
      <>
        <Prompt
          when={
            !this.state.loading &&
            !this.props.site &&
            (this.state.siteForm.name ||
              this.state.siteForm.sidebar ||
              this.state.siteForm.description)
          }
          message={i18n.t("block_leaving")}
        />
        <form onSubmit={linkEvent(this, this.handleCreateSiteSubmit)}>
          <h5>{`${
            this.props.site
              ? capitalizeFirstLetter(i18n.t("save"))
              : capitalizeFirstLetter(i18n.t("name"))
          } ${i18n.t("your_site")}`}</h5>
          <div class="form-group row">
            <label class="col-12 col-form-label" htmlFor="create-site-name">
              {i18n.t("name")}
            </label>
            <div class="col-12">
              <input
                type="text"
                id="create-site-name"
                class="form-control"
                value={this.state.siteForm.name}
                onInput={linkEvent(this, this.handleSiteNameChange)}
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>
          <div class="form-group">
            <label>{i18n.t("icon")}</label>
            <ImageUploadForm
              uploadTitle={i18n.t("upload_icon")}
              imageSrc={this.state.siteForm.icon}
              onUpload={this.handleIconUpload}
              onRemove={this.handleIconRemove}
              rounded
            />
          </div>
          <div class="form-group">
            <label>{i18n.t("banner")}</label>
            <ImageUploadForm
              uploadTitle={i18n.t("upload_banner")}
              imageSrc={this.state.siteForm.banner}
              onUpload={this.handleBannerUpload}
              onRemove={this.handleBannerRemove}
            />
          </div>
          <div class="form-group row">
            <label class="col-12 col-form-label" htmlFor="site-desc">
              {i18n.t("description")}
            </label>
            <div class="col-12">
              <input
                type="text"
                class="form-control"
                id="site-desc"
                value={this.state.siteForm.description}
                onInput={linkEvent(this, this.handleSiteDescChange)}
                maxLength={150}
              />
            </div>
          </div>
          <div class="form-group row">
            <label class="col-12 col-form-label" htmlFor={this.id}>
              {i18n.t("sidebar")}
            </label>
            <div class="col-12">
              <MarkdownTextArea
                initialContent={this.state.siteForm.sidebar}
                onContentChange={this.handleSiteSidebarChange}
                hideNavigationWarnings
              />
            </div>
          </div>
          <div class="form-group row">
            <div class="col-12">
              <div class="form-check">
                <input
                  class="form-check-input"
                  id="create-site-downvotes"
                  type="checkbox"
                  checked={this.state.siteForm.enable_downvotes}
                  onChange={linkEvent(
                    this,
                    this.handleSiteEnableDownvotesChange
                  )}
                />
                <label class="form-check-label" htmlFor="create-site-downvotes">
                  {i18n.t("enable_downvotes")}
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-12">
              <div class="form-check">
                <input
                  class="form-check-input"
                  id="create-site-enable-nsfw"
                  type="checkbox"
                  checked={this.state.siteForm.enable_nsfw}
                  onChange={linkEvent(this, this.handleSiteEnableNsfwChange)}
                />
                <label
                  class="form-check-label"
                  htmlFor="create-site-enable-nsfw"
                >
                  {i18n.t("enable_nsfw")}
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-12">
              <div class="form-check">
                <input
                  class="form-check-input"
                  id="create-site-open-registration"
                  type="checkbox"
                  checked={this.state.siteForm.open_registration}
                  onChange={linkEvent(
                    this,
                    this.handleSiteOpenRegistrationChange
                  )}
                />
                <label
                  class="form-check-label"
                  htmlFor="create-site-open-registration"
                >
                  {i18n.t("open_registration")}
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-12">
              <div class="form-check">
                <input
                  class="form-check-input"
                  id="create-site-community-creation-admin-only"
                  type="checkbox"
                  checked={this.state.siteForm.community_creation_admin_only}
                  onChange={linkEvent(
                    this,
                    this.handleSiteCommunityCreationAdminOnly
                  )}
                />
                <label
                  class="form-check-label"
                  htmlFor="create-site-community-creation-admin-only"
                >
                  {i18n.t("community_creation_admin_only")}
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-12">
              <button
                type="submit"
                class="btn btn-secondary mr-2"
                disabled={this.state.loading}
              >
                {this.state.loading ? (
                  <Spinner />
                ) : this.props.site ? (
                  capitalizeFirstLetter(i18n.t("save"))
                ) : (
                  capitalizeFirstLetter(i18n.t("create"))
                )}
              </button>
              {this.props.site && (
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={linkEvent(this, this.handleCancel)}
                >
                  {i18n.t("cancel")}
                </button>
              )}
            </div>
          </div>
        </form>
      </>
    );
  }

  handleCreateSiteSubmit(i: SiteForm, event: any) {
    event.preventDefault();
    i.state.loading = true;
    if (i.props.site) {
      WebSocketService.Instance.send(wsClient.editSite(i.state.siteForm));
    } else {
      let form: CreateSite = {
        name: i.state.siteForm.name || "My site",
        ...i.state.siteForm,
      };
      WebSocketService.Instance.send(wsClient.createSite(form));
    }
    i.setState(i.state);
  }

  handleSiteNameChange(i: SiteForm, event: any) {
    i.state.siteForm.name = event.target.value;
    i.setState(i.state);
  }

  handleSiteSidebarChange(val: string) {
    this.state.siteForm.sidebar = val;
    this.setState(this.state);
  }

  handleSiteDescChange(i: SiteForm, event: any) {
    i.state.siteForm.description = event.target.value;
    i.setState(i.state);
  }

  handleSiteEnableNsfwChange(i: SiteForm, event: any) {
    i.state.siteForm.enable_nsfw = event.target.checked;
    i.setState(i.state);
  }

  handleSiteOpenRegistrationChange(i: SiteForm, event: any) {
    i.state.siteForm.open_registration = event.target.checked;
    i.setState(i.state);
  }

  handleSiteCommunityCreationAdminOnly(i: SiteForm, event: any) {
    i.state.siteForm.community_creation_admin_only = event.target.checked;
    i.setState(i.state);
  }

  handleSiteEnableDownvotesChange(i: SiteForm, event: any) {
    i.state.siteForm.enable_downvotes = event.target.checked;
    i.setState(i.state);
  }

  handleCancel(i: SiteForm) {
    i.props.onCancel();
  }

  handleIconUpload(url: string) {
    this.state.siteForm.icon = url;
    this.setState(this.state);
  }

  handleIconRemove() {
    this.state.siteForm.icon = "";
    this.setState(this.state);
  }

  handleBannerUpload(url: string) {
    this.state.siteForm.banner = url;
    this.setState(this.state);
  }

  handleBannerRemove() {
    this.state.siteForm.banner = "";
    this.setState(this.state);
  }
}
