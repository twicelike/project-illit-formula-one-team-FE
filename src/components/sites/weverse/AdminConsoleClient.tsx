"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApi,
  getStoredTokens,
  postApi,
  resolveSlugForFandomName,
  type ArtistProfileDto,
  type CompanyDto,
  type FandomDetailDto,
  type FandomMemberDto,
  type FandomSummaryDto,
  type FanLetterDto,
  type LetterTemplateDto,
  type PostDto,
  type UserProfileDto,
  fandomApi,
} from "@/lib/api";
import {
  CheckCircleIcon,
  CloseIcon,
  DmMessageIcon,
  MenuIcon,
  VerifiedBadgeIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

type AdminMainTab =
  | "communities"
  | "artists"
  | "companies"
  | "templates"
  | "moderation";

type ModerationSubTab = "posts" | "users" | "fan-letters";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminConsoleClient() {
  const {
    user,
    loginWithCredentials,
    refreshCommunitiesFromBackend,
    openLoginModal,
    openCookieModal,
    dmMode,
    setDmMode,
    showToast,
  } = useWeverseApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminMainTab>("communities");
  const [moderationTab, setModerationTab] =
    useState<ModerationSubTab>("posts");
  const [loadingData, setLoadingData] = useState(false);
  const [switchingAdmin, setSwitchingAdmin] = useState(false);

  // ==================== 1. COMPANIES STATE ====================
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyBio, setNewCompanyBio] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyBio, setEditCompanyBio] = useState("");

  // ==================== 2. COMMUNITIES (FANDOMS) & ROSTER STATE ====================
  const [fandoms, setFandoms] = useState<FandomSummaryDto[]>([]);
  const [fandomStatusFilter, setFandomStatusFilter] = useState<string>("");
  const [fandomCompanyFilter, setFandomCompanyFilter] = useState<number | "">(
    ""
  );
  const [fandomKeyword, setFandomKeyword] = useState("");

  const [newFandomName, setNewFandomName] = useState("");
  const [newFandomCompanyId, setNewFandomCompanyId] = useState<number | "">("");
  const [newFandomBanner, setNewFandomBanner] = useState(
    "/sites/weverse/hero/slide-15.webp"
  );
  const [newFandomStatus, setNewFandomStatus] = useState<
    "ACTIVE" | "INACTIVE" | "ARCHIVED"
  >("ACTIVE");
  const [savingFandom, setSavingFandom] = useState(false);

  const [editingFandom, setEditingFandom] = useState<FandomSummaryDto | null>(
    null
  );
  const [editFandomName, setEditFandomName] = useState("");
  const [editFandomCompanyId, setEditFandomCompanyId] = useState<number | "">(
    ""
  );
  const [editFandomBanner, setEditFandomBanner] = useState("");
  const [editFandomStatus, setEditFandomStatus] = useState<
    "ACTIVE" | "INACTIVE" | "ARCHIVED"
  >("ACTIVE");

  // Community Roster & Member Roles Drawer state
  const [managingFandom, setManagingFandom] =
    useState<FandomSummaryDto | null>(null);
  const [managingFandomDetail, setManagingFandomDetail] =
    useState<FandomDetailDto | null>(null);
  const [fandomMembers, setFandomMembers] = useState<FandomMemberDto[]>([]);
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>("");
  const [assignArtistId, setAssignArtistId] = useState<number | "">("");
  const [loadingRoster, setLoadingRoster] = useState(false);

  // ==================== 3. ARTISTS PROVISIONING STATE ====================
  const [artists, setArtists] = useState<ArtistProfileDto[]>([]);
  const [artistCompanyFilter, setArtistCompanyFilter] = useState<number | "">(
    ""
  );
  const [artistKeyword, setArtistKeyword] = useState("");

  const [artistEmail, setArtistEmail] = useState("");
  const [artistLegalName, setArtistLegalName] = useState("");
  const [artistPassword, setArtistPassword] = useState("123456");
  const [artistStageName, setArtistStageName] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [artistAvatar, setArtistAvatar] = useState(
    "/sites/weverse/artists/hyolyn-logo.webp"
  );
  const [artistCompanyId, setArtistCompanyId] = useState<number | "">("");
  const [artistDebutDate, setArtistDebutDate] = useState("2024-03-25");
  const [autoAssignFandomId, setAutoAssignFandomId] = useState<number | "">("");
  const [creatingArtist, setCreatingArtist] = useState(false);

  // ==================== 4. LETTER TEMPLATES STATE ====================
  const [templates, setTemplates] = useState<LetterTemplateDto[]>([]);
  const [tplImageUrl, setTplImageUrl] = useState(
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"
  );
  const [tplIsPremium, setTplIsPremium] = useState(false);
  const [tplPrice, setTplPrice] = useState(0);
  const [tplIsActive, setTplIsActive] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<LetterTemplateDto | null>(null);

  // ==================== 5. CONTENT & USER MODERATION STATE ====================
  const [adminUsers, setAdminUsers] = useState<UserProfileDto[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const [adminPosts, setAdminPosts] = useState<PostDto[]>([]);
  const [postFandomFilter, setPostFandomFilter] = useState<number | "">("");
  const [postStatusFilter, setPostStatusFilter] = useState<string>("");

  const [adminLetters, setAdminLetters] = useState<FanLetterDto[]>([]);
  const [letterArtistFilter, setLetterArtistFilter] = useState<number | "">("");
  const [letterStatusFilter, setLetterStatusFilter] = useState<string>("");

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const handleQuickAdminLogin = async () => {
    setSwitchingAdmin(true);
    try {
      await loginWithCredentials({
        email: "admin@weverse.local",
        password: "123456",
      });
      showToast("Signed in as Weverse Admin");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Could not sign in as Admin. Please check backend connection."
      );
    } finally {
      setSwitchingAdmin(false);
    }
  };

  // Load core admin datasets
  const loadAdminOverview = useCallback(async () => {
    if (!isAdmin || !getStoredTokens()?.accessToken) return;
    setLoadingData(true);
    try {
      const [compList, fandomPage, artistPage, tplList] = await Promise.all([
        adminApi.listCompanies().catch(() => []),
        adminApi
          .listFandoms({
            status: fandomStatusFilter || undefined,
            companyId:
              fandomCompanyFilter !== ""
                ? Number(fandomCompanyFilter)
                : undefined,
            keyword: fandomKeyword.trim() || undefined,
            size: 60,
          })
          .catch(() => null),
        adminApi
          .listArtists({
            companyId:
              artistCompanyFilter !== ""
                ? Number(artistCompanyFilter)
                : undefined,
            keyword: artistKeyword.trim() || undefined,
            size: 80,
          })
          .catch(() => null),
        adminApi.listLetterTemplates().catch(() => []),
      ]);

      setCompanies(compList);
      if (compList.length > 0) {
        setNewFandomCompanyId((prev) => (prev === "" ? compList[0].id : prev));
        setArtistCompanyId((prev) => (prev === "" ? compList[0].id : prev));
      }

      if (fandomPage) {
        const fList = fandomPage.items ?? fandomPage.content ?? [];
        setFandoms(fList);
        if (fList.length > 0) {
          setAutoAssignFandomId((prev) => (prev === "" ? fList[0].id : prev));
        }
      }
      if (artistPage) {
        setArtists(artistPage.items ?? artistPage.content ?? []);
      }
      setTemplates(tplList);
    } finally {
      setLoadingData(false);
    }
  }, [
    isAdmin,
    fandomStatusFilter,
    fandomCompanyFilter,
    fandomKeyword,
    artistCompanyFilter,
    artistKeyword,
  ]);

  useEffect(() => {
    void loadAdminOverview();
  }, [loadAdminOverview]);

  // Load moderation datasets
  const loadModerationData = useCallback(async () => {
    if (!isAdmin || !getStoredTokens()?.accessToken) return;
    try {
      const [uPage, pPage, lPage] = await Promise.all([
        adminApi
          .listUsers({
            role: userRoleFilter || undefined,
            size: 60,
          })
          .catch(() => null),
        adminApi
          .listPosts({
            fandomId:
              postFandomFilter !== "" ? Number(postFandomFilter) : undefined,
            status: postStatusFilter || undefined,
            size: 60,
          })
          .catch(() => null),
        adminApi
          .listFanLetters({
            artistId:
              letterArtistFilter !== ""
                ? Number(letterArtistFilter)
                : undefined,
            status: letterStatusFilter || undefined,
            size: 60,
          })
          .catch(() => null),
      ]);

      if (uPage) setAdminUsers(uPage.items ?? uPage.content ?? []);
      if (pPage) setAdminPosts(pPage.items ?? pPage.content ?? []);
      if (lPage) setAdminLetters(lPage.items ?? lPage.content ?? []);
    } catch {
      // Ignore
    }
  }, [
    isAdmin,
    userRoleFilter,
    postFandomFilter,
    postStatusFilter,
    letterArtistFilter,
    letterStatusFilter,
  ]);

  useEffect(() => {
    void loadModerationData();
  }, [loadModerationData]);

  // Load selected community roster & members
  const openFandomRosterManager = useCallback(
    async (fandom: FandomSummaryDto, roleFilter = "") => {
      setManagingFandom(fandom);
      setMemberRoleFilter(roleFilter);
      setLoadingRoster(true);
      try {
        const [detail, membersPage] = await Promise.all([
          fandomApi.getFandomDetail(fandom.id).catch(() => null),
          adminApi
            .listFandomMembers(fandom.id, {
              role: roleFilter || undefined,
              size: 80,
            })
            .catch(() => null),
        ]);
        if (detail) setManagingFandomDetail(detail);
        if (membersPage) {
          setFandomMembers(membersPage.items ?? membersPage.content ?? []);
        }
      } finally {
        setLoadingRoster(false);
      }
    },
    []
  );

  // ==================== HANDLERS: 1. COMPANIES ====================

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setSavingCompany(true);
    try {
      const created = await adminApi.createCompany({
        name: newCompanyName.trim(),
        bio: newCompanyBio.trim() || null,
      });
      setCompanies((prev) => [created, ...prev]);
      setNewCompanyName("");
      setNewCompanyBio("");
      showToast(`Created entertainment agency "${created.name}"`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not create agency"
      );
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editCompanyName.trim()) return;
    setSavingCompany(true);
    try {
      const updated = await adminApi.updateCompany(editingCompany.id, {
        name: editCompanyName.trim(),
        bio: editCompanyBio.trim() || null,
      });
      setCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingCompany(null);
      showToast(`Updated "${updated.name}"`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update agency"
      );
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDeleteCompany = async (comp: CompanyDto) => {
    try {
      await adminApi.deleteCompany(comp.id);
      setCompanies((prev) => prev.filter((c) => c.id !== comp.id));
      showToast(`Removed agency "${comp.name}"`);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Cannot delete agency while communities or artists are linked to it."
      );
    }
  };

  // ==================== HANDLERS: 2. COMMUNITIES & ROSTER ====================

  const handleCreateFandom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFandomName.trim() || newFandomCompanyId === "") {
      showToast("Please enter a community name and select an agency.");
      return;
    }
    setSavingFandom(true);
    try {
      const created = await adminApi.createFandom({
        companyId: Number(newFandomCompanyId),
        name: newFandomName.trim(),
        bannerUrl: newFandomBanner.trim() || null,
        status: newFandomStatus,
      });
      setFandoms((prev) => [created, ...prev]);
      setNewFandomName("");
      showToast(`Community "${created.name}" created!`);
      await refreshCommunitiesFromBackend();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create community"
      );
    } finally {
      setSavingFandom(false);
    }
  };

  const handleSaveEditFandom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFandom || !editFandomName.trim() || editFandomCompanyId === "")
      return;
    setSavingFandom(true);
    try {
      const updated = await adminApi.updateFandom(editingFandom.id, {
        companyId: Number(editFandomCompanyId),
        name: editFandomName.trim(),
        bannerUrl: editFandomBanner.trim() || null,
        status: editFandomStatus,
      });
      setFandoms((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      );
      setEditingFandom(null);
      showToast(`Updated community "${updated.name}"`);
      await refreshCommunitiesFromBackend();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update community"
      );
    } finally {
      setSavingFandom(false);
    }
  };

  const handleChangeFandomStatus = async (
    fandom: FandomSummaryDto,
    nextStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  ) => {
    try {
      const updated = await adminApi.updateFandomStatus(fandom.id, nextStatus);
      setFandoms((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      );
      showToast(`${fandom.name} status changed to ${nextStatus}`);
      await refreshCommunitiesFromBackend();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not change community status"
      );
    }
  };

  const handleDeleteFandom = async (fandom: FandomSummaryDto) => {
    try {
      await adminApi.deleteFandom(fandom.id);
      setFandoms((prev) => prev.filter((f) => f.id !== fandom.id));
      if (managingFandom?.id === fandom.id) {
        setManagingFandom(null);
      }
      showToast(`Deleted community "${fandom.name}"`);
      await refreshCommunitiesFromBackend();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete community"
      );
    }
  };

  const handleAssignArtistToFandom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingFandom || assignArtistId === "") return;
    try {
      await adminApi.assignArtistToFandom(
        managingFandom.id,
        Number(assignArtistId)
      );
      setAssignArtistId("");
      showToast(`Assigned artist to ${managingFandom.name}!`);
      await openFandomRosterManager(managingFandom, memberRoleFilter);
      await loadAdminOverview();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not assign artist"
      );
    }
  };

  const handleRemoveArtistFromFandom = async (artistUserId: number) => {
    if (!managingFandom) return;
    try {
      await adminApi.removeArtistFromFandom(managingFandom.id, artistUserId);
      showToast(`Removed artist from ${managingFandom.name}`);
      await openFandomRosterManager(managingFandom, memberRoleFilter);
      await loadAdminOverview();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not remove artist"
      );
    }
  };

  const handleUpdateMemberRole = async (
    member: FandomMemberDto,
    nextRole: "MEMBER" | "VIP_MEMBER" | "ARTIST" | "MODERATOR"
  ) => {
    if (!managingFandom) return;
    try {
      const updated = await adminApi.updateFandomMemberRole(
        managingFandom.id,
        member.userId,
        nextRole
      );
      setFandomMembers((prev) =>
        prev.map((m) => (m.userId === updated.userId ? updated : m))
      );
      showToast(`Updated ${member.name}'s role to ${nextRole}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemoveMemberFromFandom = async (member: FandomMemberDto) => {
    if (!managingFandom) return;
    try {
      await adminApi.removeFandomMember(managingFandom.id, member.userId);
      setFandomMembers((prev) =>
        prev.filter((m) => m.userId !== member.userId)
      );
      showToast(`Removed ${member.name} from ${managingFandom.name}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not remove member");
    }
  };

  // ==================== HANDLERS: 3. ARTISTS PROVISIONING ====================

  const handleCreateArtistAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !artistStageName.trim() ||
      !artistEmail.trim() ||
      !artistLegalName.trim() ||
      artistCompanyId === ""
    ) {
      showToast("Please fill in stage name, legal name, email, and agency.");
      return;
    }
    setCreatingArtist(true);
    try {
      const debutIso = artistDebutDate
        ? `${artistDebutDate}T00:00:00`
        : undefined;
      const created = await adminApi.createArtistAccount({
        email: artistEmail.trim(),
        name: artistLegalName.trim(),
        password: artistPassword || "123456",
        stageName: artistStageName.trim(),
        bio:
          artistBio.trim() ||
          `Official Weverse artist profile for ${artistStageName.trim()}.`,
        avatar: artistAvatar.trim() || null,
        companyId: Number(artistCompanyId),
        debutDate: debutIso,
      });

      if (autoAssignFandomId !== "") {
        try {
          await adminApi.assignArtistToFandom(
            Number(autoAssignFandomId),
            created.userId
          );
        } catch {
          // Optional assignment
        }
      }

      setArtists((prev) => [created, ...prev]);
      setArtistStageName("");
      setArtistLegalName("");
      setArtistEmail("");
      setArtistBio("");
      showToast(
        `Created official artist account for "${created.stageName}"!`
      );
      await loadAdminOverview();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not create artist account"
      );
    } finally {
      setCreatingArtist(false);
    }
  };

  // ==================== HANDLERS: 4. LETTER TEMPLATES ====================

  const handleSaveLetterTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = tplImageUrl.trim();
    if (!/^https?:\/\/.+/.test(trimmedUrl)) {
      showToast("Template image URL must start with https:// or http://");
      return;
    }
    setSavingTemplate(true);
    try {
      if (editingTemplate) {
        const updated = await adminApi.updateLetterTemplate(
          editingTemplate.id,
          {
            imageUrl: trimmedUrl,
            isPremium: tplIsPremium,
            price: tplIsPremium ? Math.max(0, Number(tplPrice)) : 0,
            isActive: tplIsActive,
          }
        );
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setEditingTemplate(null);
        showToast(`Updated paper template #${updated.id}`);
      } else {
        const created = await adminApi.createLetterTemplate({
          imageUrl: trimmedUrl,
          isPremium: tplIsPremium,
          price: tplIsPremium ? Math.max(0, Number(tplPrice)) : 0,
          isActive: tplIsActive,
        });
        setTemplates((prev) => [created, ...prev]);
        showToast("Created new fan letter paper template!");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not save letter template"
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleToggleTemplateStatus = async (tpl: LetterTemplateDto) => {
    try {
      const updated = await adminApi.updateLetterTemplateStatus(
        tpl.id,
        !tpl.isActive
      );
      setTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      showToast(
        updated.isActive ? "Template activated" : "Template deactivated"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update template status"
      );
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await adminApi.deleteLetterTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      showToast("Deleted letter template");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete template"
      );
    }
  };

  // ==================== HANDLERS: 5. MODERATION ====================

  const handleToggleUserActive = async (targetUser: UserProfileDto) => {
    const currentlyActive = targetUser.isActive !== false;
    try {
      const updated = await adminApi.updateUserStatus(
        targetUser.id,
        !currentlyActive
      );
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      showToast(
        updated.isActive
          ? `Reactivated account "${updated.name}"`
          : `Suspended account "${updated.name}"`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not change user status"
      );
    }
  };

  const handleChangePostStatus = async (
    post: PostDto,
    nextStatus: "PUBLISHED" | "HIDDEN" | "DELETED"
  ) => {
    try {
      const updated = await adminApi.updatePostStatus(post.id, nextStatus);
      setAdminPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      showToast(
        nextStatus === "PUBLISHED"
          ? "Post restored and visible in community"
          : nextStatus === "HIDDEN"
            ? "Post hidden from public community feed"
            : "Post marked as deleted"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update post status"
      );
    }
  };

  const handleChangeLetterStatus = async (
    letter: FanLetterDto,
    nextStatus: "PUBLISHED" | "HIDDEN" | "DELETED"
  ) => {
    try {
      const updated = await adminApi.updateFanLetterStatus(
        letter.id,
        nextStatus
      );
      setAdminLetters((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      showToast(
        nextStatus === "PUBLISHED"
          ? "Fan letter restored to community wall"
          : nextStatus === "HIDDEN"
            ? "Fan letter hidden from community wall"
            : "Fan letter marked as deleted"
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Could not update fan letter status"
      );
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.bio ?? "").toLowerCase().includes(q)
    );
  }, [companies, companySearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.artistProfile?.stageName ?? "").toLowerCase().includes(q)
    );
  }, [adminUsers, userSearchQuery]);

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-black">
      {/* Top Global Header */}
      <header className="wev-header border-b border-black/[0.06] bg-white">
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black hover:bg-black/[0.04]"
          >
            <MenuIcon className="h-[24px] w-[24px]" />
          </button>
          <Link
            href="/"
            aria-label="Weverse Home"
            className="flex items-center text-black no-underline"
          >
            <WeverseWordmarkIcon className="h-[20px] w-[95px]" />
          </Link>
          <span className="rounded-full bg-[#121c2e] px-[12px] py-[4px] text-[11px] font-extrabold text-[#00cbd5] max-[600px]:hidden">
            🛡️ ADMIN &amp; MODERATION CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Link
            href="/"
            className="rounded-full bg-[#f2f4f8] px-[14px] py-[7px] text-[12px] font-bold text-[#222222] no-underline hover:bg-[#e5e8ef]"
          >
            🏠 Discover Home
          </Link>
          <Link
            href="/profile"
            className="rounded-full bg-[#f2f4f8] px-[14px] py-[7px] text-[12px] font-bold text-[#222222] no-underline hover:bg-[#e5e8ef]"
          >
            👤 My Profile
          </Link>
          <button
            type="button"
            onClick={() =>
              setDmMode(dmMode === "closed" ? "home" : "minimized")
            }
            aria-label="Weverse DM"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black hover:bg-black/[0.04]"
          >
            <DmMessageIcon className="h-[24px] w-[24px]" />
          </button>
        </div>
      </header>

      <WeverseGlobalMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchDrawerOpen(true)}
      />
      <SearchCommunitiesDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
      />

      <main className="mx-auto max-w-[1380px] px-[24px] pb-[80px] pt-[80px] max-[673px]:px-[14px]">
        {!isAdmin ? (
          <section className="mx-auto mt-[32px] max-w-[560px] rounded-[22px] border border-black/[0.06] bg-white p-[40px] text-center shadow-sm">
            <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#121c2e] text-[24px] text-[#00cbd5]">
              🛡️
            </span>
            <h1 className="m-0 mt-[16px] text-[22px] font-extrabold text-black">
              Administrator Access Only
            </h1>
            <p className="mx-auto mb-0 mt-[8px] max-w-[440px] text-[14px] leading-[21px] text-[#666666]">
              {user
                ? `Your current account (${user.nickname}) does not have Administrator permissions to view this page.`
                : "Please sign in with an authorized Weverse Administrator account to access the Admin & Moderation Console."}
            </p>
            <div className="mt-[22px] flex flex-wrap justify-center gap-[10px]">
              <Link
                href="/"
                className="inline-flex h-[42px] items-center justify-center rounded-full bg-black px-[22px] text-[13px] font-extrabold text-white no-underline hover:bg-[#222222]"
              >
                Back to Weverse Home
              </Link>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="h-[42px] rounded-full border border-black/15 bg-white px-[20px] text-[13px] font-bold text-[#333333] hover:bg-[#f7f8fa]"
              >
                Sign In with Admin Account
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Admin Hero Overview Card */}
            <section className="rounded-[22px] bg-[#121c2e] p-[26px] text-white shadow-[0_8px_30px_rgba(18,28,46,0.16)]">
              <div className="flex flex-wrap items-center justify-between gap-[16px]">
                <div>
                  <span className="inline-block rounded-full bg-[#00cbd5]/20 px-[12px] py-[4px] text-[11px] font-extrabold uppercase tracking-wider text-[#00cbd5]">
                    WEVERSE PLATFORM ADMINISTRATION
                  </span>
                  <h1 className="m-0 mt-[8px] text-[26px] font-extrabold text-white">
                    Weverse Admin &amp; Content Moderation Console
                  </h1>
                  <p className="mb-0 mt-[4px] text-[13px] text-white/75">
                    Manage entertainment agencies, official communities, artist
                    accounts, fan letter stationery, and community safety in
                    real time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-[10px]">
                  <span className="inline-flex items-center gap-[6px] rounded-full bg-[#00cbd5] px-[14px] py-[7px] text-[12px] font-extrabold text-white">
                    <CheckCircleIcon className="h-[15px] w-[15px]" />
                    <span>Signed in as {user?.nickname} (Admin)</span>
                  </span>
                  <button
                    type="button"
                    disabled={loadingData}
                    onClick={() => {
                      void loadAdminOverview();
                      void loadModerationData();
                      showToast("Refreshed platform data");
                    }}
                    className="rounded-full bg-white/15 px-[16px] py-[7px] text-[12px] font-bold text-white hover:bg-white/25"
                  >
                    {loadingData ? "Refreshing..." : "↻ Refresh Data"}
                  </button>
                </div>
              </div>

              {/* 5 Live Metric Cards */}
              <div className="mt-[22px] grid grid-cols-5 gap-[12px] max-[1024px]:grid-cols-3 max-[640px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("communities")}
                  className="rounded-[14px] bg-[#1d2b44] p-[14px] text-left transition-colors hover:bg-[#253655]"
                >
                  <strong className="block text-[22px] font-extrabold text-[#00cbd5]">
                    {fandoms.length}
                  </strong>
                  <span className="text-[12px] font-semibold text-white/85">
                    Official Communities
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("artists")}
                  className="rounded-[14px] bg-[#1d2b44] p-[14px] text-left transition-colors hover:bg-[#253655]"
                >
                  <strong className="block text-[22px] font-extrabold text-[#00cbd5]">
                    {artists.length}
                  </strong>
                  <span className="text-[12px] font-semibold text-white/85">
                    Official Artists
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("companies")}
                  className="rounded-[14px] bg-[#1d2b44] p-[14px] text-left transition-colors hover:bg-[#253655]"
                >
                  <strong className="block text-[22px] font-extrabold text-[#00cbd5]">
                    {companies.length}
                  </strong>
                  <span className="text-[12px] font-semibold text-white/85">
                    Entertainment Agencies
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("templates")}
                  className="rounded-[14px] bg-[#1d2b44] p-[14px] text-left transition-colors hover:bg-[#253655]"
                >
                  <strong className="block text-[22px] font-extrabold text-[#00cbd5]">
                    {templates.length}
                  </strong>
                  <span className="text-[12px] font-semibold text-white/85">
                    Letter Stationery Templates
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("moderation")}
                  className="rounded-[14px] bg-[#1d2b44] p-[14px] text-left transition-colors hover:bg-[#253655]"
                >
                  <strong className="block text-[22px] font-extrabold text-[#e9687e]">
                    {adminPosts.length + adminLetters.length}
                  </strong>
                  <span className="text-[12px] font-semibold text-white/85">
                    Moderated Posts &amp; Letters
                  </span>
                </button>
              </div>

              {/* 5 Main Navigation Tabs */}
              <div className="mt-[20px] flex flex-wrap items-center gap-[8px] border-t border-white/10 pt-[16px]">
                {(
                  [
                    {
                      id: "communities",
                      label: `🏛️ Communities & Roster (${fandoms.length})`,
                    },
                    {
                      id: "artists",
                      label: `🎤 Artist Provisioning (${artists.length})`,
                    },
                    {
                      id: "companies",
                      label: `🏢 Entertainment Agencies (${companies.length})`,
                    },
                    {
                      id: "templates",
                      label: `💌 Fan Letter Templates (${templates.length})`,
                    },
                    {
                      id: "moderation",
                      label: `🛡️ Content & User Moderation`,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`rounded-full px-[18px] py-[9px] text-[13px] font-extrabold transition-colors ${
                      activeTab === t.id
                        ? "bg-[#00cbd5] text-white shadow"
                        : "bg-white/10 text-white/85 hover:bg-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-[24px]">
            {/* ================================================================= */}
            {/* TAB 1: COMMUNITIES & ROSTER MANAGEMENT                            */}
            {/* ================================================================= */}
            {activeTab === "communities" && (
              <div className="grid grid-cols-[380px_1fr] items-start gap-[22px] max-[1080px]:grid-cols-1">
                {/* Left Column: Create or Edit Community Form */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <h2 className="m-0 text-[17px] font-extrabold text-black">
                    {editingFandom
                      ? `✏️ Edit Community: ${editingFandom.name}`
                      : "➕ Create Official Community"}
                  </h2>
                  <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                    Launch a new artist community hub or update community
                    settings and visibility status.
                  </p>

                  <form
                    onSubmit={(e) =>
                      void (editingFandom
                        ? handleSaveEditFandom(e)
                        : handleCreateFandom(e))
                    }
                    className="mt-[16px] space-y-[12px]"
                  >
                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Community / Artist Group Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingFandom ? editFandomName : newFandomName}
                        onChange={(e) =>
                          editingFandom
                            ? setEditFandomName(e.target.value)
                            : setNewFandomName(e.target.value)
                        }
                        placeholder="e.g. BABYMONSTER or NewJeans"
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Entertainment Agency
                      </label>
                      <select
                        required
                        value={
                          editingFandom
                            ? editFandomCompanyId
                            : newFandomCompanyId
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : "";
                          if (editingFandom) setEditFandomCompanyId(val);
                          else setNewFandomCompanyId(val);
                        }}
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      >
                        <option value="">Select Agency...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Community Banner Image URL
                      </label>
                      <input
                        type="text"
                        value={
                          editingFandom ? editFandomBanner : newFandomBanner
                        }
                        onChange={(e) =>
                          editingFandom
                            ? setEditFandomBanner(e.target.value)
                            : setNewFandomBanner(e.target.value)
                        }
                        placeholder="/sites/weverse/hero/slide-15.webp"
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Community Status
                      </label>
                      <select
                        value={
                          editingFandom ? editFandomStatus : newFandomStatus
                        }
                        onChange={(e) => {
                          const st = e.target.value as
                            | "ACTIVE"
                            | "INACTIVE"
                            | "ARCHIVED";
                          if (editingFandom) setEditFandomStatus(st);
                          else setNewFandomStatus(st);
                        }}
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      >
                        <option value="ACTIVE">Active (Visible to Fans)</option>
                        <option value="INACTIVE">
                          Inactive (Temporarily Hidden)
                        </option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>

                    <div className="flex gap-[8px] pt-[4px]">
                      <button
                        type="submit"
                        disabled={savingFandom}
                        className="h-[42px] flex-1 rounded-[10px] bg-[#00cbd5] text-[13px] font-extrabold text-white hover:bg-[#00b8c1] disabled:opacity-60"
                      >
                        {savingFandom
                          ? "Saving..."
                          : editingFandom
                            ? "Save Community Changes"
                            : "Create Community"}
                      </button>
                      {editingFandom && (
                        <button
                          type="button"
                          onClick={() => setEditingFandom(null)}
                          className="h-[42px] rounded-[10px] border border-black/15 bg-white px-[14px] text-[12px] font-bold text-[#484848]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Right Column: Communities Directory + Roster & Member Role Drawer */}
                <div className="space-y-[18px]">
                  <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-[12px]">
                      <div>
                        <h2 className="m-0 text-[18px] font-extrabold text-black">
                          🏛️ Official Communities ({fandoms.length})
                        </h2>
                        <span className="text-[12px] text-[#666666]">
                          Click &ldquo;Manage Artists &amp; Members&rdquo; on
                          any community to assign idols or grant VIP/Moderator
                          roles
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-[8px]">
                        <input
                          type="text"
                          value={fandomKeyword}
                          onChange={(e) => setFandomKeyword(e.target.value)}
                          placeholder="Search communities..."
                          className="h-[36px] rounded-full border border-black/15 bg-[#f7f8fa] px-[14px] text-[12px] text-black outline-none focus:border-[#00cbd5]"
                        />
                        <select
                          value={fandomStatusFilter}
                          onChange={(e) =>
                            setFandomStatusFilter(e.target.value)
                          }
                          className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                        >
                          <option value="">All Statuses</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                        <select
                          value={fandomCompanyFilter}
                          onChange={(e) =>
                            setFandomCompanyFilter(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                        >
                          <option value="">All Agencies</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-[16px] grid grid-cols-2 gap-[12px] max-[800px]:grid-cols-1">
                      {fandoms.map((f) => {
                        const slug = resolveSlugForFandomName(f.name);
                        const isManaging = managingFandom?.id === f.id;
                        return (
                          <div
                            key={f.id}
                            className={`flex flex-col justify-between rounded-[14px] border p-[14px] transition-colors ${
                              isManaging
                                ? "border-2 border-[#00cbd5] bg-[#dffafb]/25"
                                : "border-black/[0.06] bg-[#f7f8fa]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-[10px]">
                              <div className="flex min-w-0 items-center gap-[12px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    f.bannerUrl ||
                                    "/sites/weverse/artists/kep1er-logo.webp"
                                  }
                                  alt={f.name}
                                  className="h-[48px] w-[48px] shrink-0 rounded-[10px] object-cover"
                                />
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-[6px]">
                                    <Link
                                      href={`/${slug}`}
                                      className="truncate text-[15px] font-extrabold text-black no-underline hover:underline"
                                    >
                                      {f.name}
                                    </Link>
                                    <span
                                      className={`rounded-full px-[8px] py-[2px] text-[10px] font-extrabold ${
                                        f.status === "ACTIVE"
                                          ? "bg-[#dffafb] text-[#008b94]"
                                          : f.status === "INACTIVE"
                                            ? "bg-[#fff3e0] text-[#d97706]"
                                            : "bg-[#ebedf2] text-[#666666]"
                                      }`}
                                    >
                                      {f.status}
                                    </span>
                                  </div>
                                  <span className="mt-[2px] block text-[11px] font-semibold text-[#666666]">
                                    {f.company?.name || "Weverse Global"} ·{" "}
                                    {f.memberCount.toLocaleString()} members
                                  </span>
                                </div>
                              </div>

                              <select
                                aria-label={`Change ${f.name} status`}
                                value={f.status}
                                onChange={(e) =>
                                  void handleChangeFandomStatus(
                                    f,
                                    e.target.value as
                                      | "ACTIVE"
                                      | "INACTIVE"
                                      | "ARCHIVED"
                                  )
                                }
                                className="h-[28px] rounded-[6px] border border-black/10 bg-white px-[6px] text-[11px] font-bold text-[#333333] outline-none"
                              >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                            </div>

                            <div className="mt-[12px] flex flex-wrap items-center justify-between gap-[6px] border-t border-black/[0.05] pt-[10px]">
                              <button
                                type="button"
                                onClick={() => void openFandomRosterManager(f)}
                                className="rounded-full bg-[#121c2e] px-[12px] py-[5px] text-[11px] font-extrabold text-white hover:bg-[#1e2e4a]"
                              >
                                👥 Manage Artists &amp; Members
                              </button>

                              <div className="flex items-center gap-[6px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFandom(f);
                                    setEditFandomName(f.name);
                                    setEditFandomCompanyId(
                                      f.company?.id ??
                                        (companies[0]?.id || "")
                                    );
                                    setEditFandomBanner(f.bannerUrl || "");
                                    setEditFandomStatus(
                                      (f.status as
                                        | "ACTIVE"
                                        | "INACTIVE"
                                        | "ARCHIVED") || "ACTIVE"
                                    );
                                  }}
                                  className="rounded-[6px] bg-white px-[8px] py-[4px] text-[11px] font-bold text-[#333333] shadow-sm hover:bg-[#ebedf2]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteFandom(f)}
                                  className="rounded-[6px] bg-[#fff2f2] px-[8px] py-[4px] text-[11px] font-bold text-[#d63333] hover:bg-[#ffe3e3]"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 2: OFFICIAL ARTIST ACCOUNT PROVISIONING & DIRECTORY           */}
            {/* ================================================================= */}
            {activeTab === "artists" && (
              <div className="grid grid-cols-[400px_1fr] items-start gap-[22px] max-[1080px]:grid-cols-1">
                {/* Left Column: Provision New Official Artist Account */}
                <section className="rounded-[18px] border border-[#e9687e]/40 bg-white p-[22px] shadow-sm">
                  <span className="inline-block rounded-full bg-[#fce8ee] px-[10px] py-[3px] text-[10px] font-extrabold text-[#d6335a]">
                    OFFICIAL IDOL ONBOARDING
                  </span>
                  <h2 className="m-0 mt-[6px] text-[18px] font-extrabold text-black">
                    🎤 Provision New Artist Account
                  </h2>
                  <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                    Create a verified Weverse Artist account and optionally
                    assign them directly to an official community.
                  </p>

                  <form
                    onSubmit={(e) => void handleCreateArtistAccount(e)}
                    className="mt-[16px] space-y-[12px]"
                  >
                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Stage Name
                        </label>
                        <input
                          type="text"
                          required
                          value={artistStageName}
                          onChange={(e) => setArtistStageName(e.target.value)}
                          placeholder="e.g. HANNIE"
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Full / Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          value={artistLegalName}
                          onChange={(e) => setArtistLegalName(e.target.value)}
                          placeholder="e.g. Pham Ngoc Han"
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Artist Login Email
                        </label>
                        <input
                          type="email"
                          required
                          value={artistEmail}
                          onChange={(e) => setArtistEmail(e.target.value)}
                          placeholder="artist@weverse.local"
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Initial Password
                        </label>
                        <input
                          type="text"
                          required
                          value={artistPassword}
                          onChange={(e) => setArtistPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Entertainment Agency
                        </label>
                        <select
                          required
                          value={artistCompanyId}
                          onChange={(e) =>
                            setArtistCompanyId(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        >
                          <option value="">Select Agency...</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Debut Date
                        </label>
                        <input
                          type="date"
                          value={artistDebutDate}
                          onChange={(e) => setArtistDebutDate(e.target.value)}
                          className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Assign Directly to Community (Optional)
                      </label>
                      <select
                        value={autoAssignFandomId}
                        onChange={(e) =>
                          setAutoAssignFandomId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      >
                        <option value="">Do not assign yet</option>
                        {fandoms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.company?.name || "Weverse"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Avatar Image URL
                      </label>
                      <input
                        type="text"
                        value={artistAvatar}
                        onChange={(e) => setArtistAvatar(e.target.value)}
                        placeholder="/sites/weverse/artists/hyolyn-logo.webp"
                        className="mt-[4px] h-[38px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Official Biography
                      </label>
                      <textarea
                        rows={2}
                        value={artistBio}
                        onChange={(e) => setArtistBio(e.target.value)}
                        placeholder="Official Weverse artist introduction..."
                        className="mt-[4px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] p-[10px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingArtist}
                      className="h-[42px] w-full rounded-[10px] bg-[#e9687e] text-[13px] font-extrabold text-white shadow hover:opacity-95 disabled:opacity-60"
                    >
                      {creatingArtist
                        ? "Provisioning Artist Account..."
                        : "✨ Create Official Artist Account"}
                    </button>
                  </form>
                </section>

                {/* Right Column: Official Artists Directory */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-[12px]">
                    <div>
                      <h2 className="m-0 text-[18px] font-extrabold text-black">
                        🎤 Official Artists Directory ({artists.length})
                      </h2>
                      <span className="text-[12px] text-[#666666]">
                        Verified idol accounts across all Weverse agencies
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-[8px]">
                      <input
                        type="text"
                        value={artistKeyword}
                        onChange={(e) => setArtistKeyword(e.target.value)}
                        placeholder="Search by stage name..."
                        className="h-[36px] rounded-full border border-black/15 bg-[#f7f8fa] px-[14px] text-[12px] text-black outline-none focus:border-[#00cbd5]"
                      />
                      <select
                        value={artistCompanyFilter}
                        onChange={(e) =>
                          setArtistCompanyFilter(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Agencies</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-[16px] grid grid-cols-3 gap-[12px] max-[920px]:grid-cols-2 max-[580px]:grid-cols-1">
                    {artists.map((art) => (
                      <div
                        key={art.userId}
                        className="flex flex-col justify-between rounded-[14px] border border-black/[0.06] bg-[#f7f8fa] p-[14px]"
                      >
                        <div className="flex items-center gap-[10px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              art.avatar ||
                              "/sites/weverse/artists/kep1er-logo.webp"
                            }
                            alt={art.stageName}
                            className="h-[44px] w-[44px] shrink-0 rounded-full border border-[#00cbd5] object-cover"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-[4px]">
                              <strong className="truncate text-[14px] font-extrabold text-black">
                                {art.stageName}
                              </strong>
                              <VerifiedBadgeIcon className="h-[14px] w-[14px] shrink-0" />
                            </div>
                            <span className="block truncate text-[11px] font-bold text-[#008b94]">
                              {art.company?.name || "Weverse Agency"}
                            </span>
                            <span className="block text-[11px] text-[#8e8e8e]">
                              {(art.followersCount ?? 0).toLocaleString()}{" "}
                              followers
                            </span>
                          </div>
                        </div>

                        {art.bio && (
                          <p className="mb-0 mt-[8px] line-clamp-2 text-[12px] text-[#484848]">
                            {art.bio}
                          </p>
                        )}

                        <div className="mt-[10px] flex items-center justify-between border-t border-black/[0.05] pt-[8px]">
                          <span className="text-[10px] font-semibold text-[#8e8e8e]">
                            {art.debutDate
                              ? `Debut: ${new Date(
                                  art.debutDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}`
                              : "Verified Artist"}
                          </span>
                          <Link
                            href={`/users/${art.userId}`}
                            className="text-[11px] font-extrabold text-[#008b94] no-underline hover:underline"
                          >
                            View Profile →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 3: ENTERTAINMENT AGENCIES (COMPANIES)                         */}
            {/* ================================================================= */}
            {activeTab === "companies" && (
              <div className="grid grid-cols-[380px_1fr] items-start gap-[22px] max-[1080px]:grid-cols-1">
                {/* Create / Edit Agency Form */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <h2 className="m-0 text-[17px] font-extrabold text-black">
                    {editingCompany
                      ? `✏️ Edit Agency: ${editingCompany.name}`
                      : "➕ Register Entertainment Agency"}
                  </h2>
                  <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                    Manage official record labels and entertainment companies
                    partnered with Weverse.
                  </p>

                  <form
                    onSubmit={(e) =>
                      void (editingCompany
                        ? handleSaveEditCompany(e)
                        : handleCreateCompany(e))
                    }
                    className="mt-[16px] space-y-[12px]"
                  >
                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Agency / Label Name
                      </label>
                      <input
                        type="text"
                        required
                        value={
                          editingCompany ? editCompanyName : newCompanyName
                        }
                        onChange={(e) =>
                          editingCompany
                            ? setEditCompanyName(e.target.value)
                            : setNewCompanyName(e.target.value)
                        }
                        placeholder="e.g. ADOR or HYBE Labels"
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Agency Introduction / Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingCompany ? editCompanyBio : newCompanyBio}
                        onChange={(e) =>
                          editingCompany
                            ? setEditCompanyBio(e.target.value)
                            : setNewCompanyBio(e.target.value)
                        }
                        placeholder="Official entertainment label partner on Weverse..."
                        className="mt-[5px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] p-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div className="flex gap-[8px]">
                      <button
                        type="submit"
                        disabled={savingCompany}
                        className="h-[42px] flex-1 rounded-[10px] bg-[#00cbd5] text-[13px] font-extrabold text-white hover:bg-[#00b8c1]"
                      >
                        {savingCompany
                          ? "Saving..."
                          : editingCompany
                            ? "Save Agency Changes"
                            : "Add Entertainment Agency"}
                      </button>
                      {editingCompany && (
                        <button
                          type="button"
                          onClick={() => setEditingCompany(null)}
                          className="h-[42px] rounded-[10px] border border-black/15 bg-white px-[14px] text-[12px] font-bold text-[#484848]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Agencies List */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-[12px]">
                    <h2 className="m-0 text-[18px] font-extrabold text-black">
                      🏢 Partnered Entertainment Agencies (
                      {filteredCompanies.length})
                    </h2>
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Filter agencies..."
                      className="h-[36px] rounded-full border border-black/15 bg-[#f7f8fa] px-[14px] text-[12px] text-black outline-none focus:border-[#00cbd5]"
                    />
                  </div>

                  <div className="mt-[16px] grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1">
                    {filteredCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-[12px] rounded-[14px] border border-black/[0.06] bg-[#f7f8fa] p-[16px]"
                      >
                        <div>
                          <strong className="block text-[15px] font-extrabold text-black">
                            {c.name}
                          </strong>
                          <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                            {c.bio ||
                              "Official entertainment agency partner on Weverse."}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-[6px]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCompany(c);
                              setEditCompanyName(c.name);
                              setEditCompanyBio(c.bio || "");
                            }}
                            className="rounded-[6px] bg-white px-[10px] py-[5px] text-[11px] font-bold text-[#333333] shadow-sm hover:bg-[#ebedf2]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteCompany(c)}
                            className="rounded-[6px] bg-[#fff2f2] px-[10px] py-[5px] text-[11px] font-bold text-[#d63333] hover:bg-[#ffe3e3]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 4: FAN LETTER PAPER TEMPLATES                                 */}
            {/* ================================================================= */}
            {activeTab === "templates" && (
              <div className="grid grid-cols-[380px_1fr] items-start gap-[22px] max-[1080px]:grid-cols-1">
                {/* Create / Edit Template Form */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <h2 className="m-0 text-[17px] font-extrabold text-black">
                    {editingTemplate
                      ? `✏️ Edit Paper Template #${editingTemplate.id}`
                      : "➕ Create Fan Letter Paper Template"}
                  </h2>
                  <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                    Design background stationery templates for fans sending
                    letters to their favorite artists.
                  </p>

                  <form
                    onSubmit={(e) => void handleSaveLetterTemplate(e)}
                    className="mt-[16px] space-y-[12px]"
                  >
                    <div>
                      <label className="block text-[12px] font-bold text-[#484848]">
                        Stationery Background Image URL (https://...)
                      </label>
                      <input
                        type="url"
                        required
                        value={tplImageUrl}
                        onChange={(e) => setTplImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[13px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Template Tier
                        </label>
                        <select
                          value={tplIsPremium ? "PREMIUM" : "FREE"}
                          onChange={(e) =>
                            setTplIsPremium(e.target.value === "PREMIUM")
                          }
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none"
                        >
                          <option value="FREE">Free Template</option>
                          <option value="PREMIUM">Premium (Jelly)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Jelly Price
                        </label>
                        <input
                          type="number"
                          min={0}
                          disabled={!tplIsPremium}
                          value={tplIsPremium ? tplPrice : 0}
                          onChange={(e) => setTplPrice(Number(e.target.value))}
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[10px] text-[13px] text-black outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-[8px] text-[13px] font-semibold text-[#333333]">
                      <input
                        type="checkbox"
                        checked={tplIsActive}
                        onChange={(e) => setTplIsActive(e.target.checked)}
                      />
                      <span>Active and selectable by fans immediately</span>
                    </label>

                    <div className="flex gap-[8px]">
                      <button
                        type="submit"
                        disabled={savingTemplate}
                        className="h-[42px] flex-1 rounded-[10px] bg-[#00cbd5] text-[13px] font-extrabold text-white hover:bg-[#00b8c1]"
                      >
                        {savingTemplate
                          ? "Saving..."
                          : editingTemplate
                            ? "Save Template Changes"
                            : "Add Stationery Template"}
                      </button>
                      {editingTemplate && (
                        <button
                          type="button"
                          onClick={() => setEditingTemplate(null)}
                          className="h-[42px] rounded-[10px] border border-black/15 bg-white px-[14px] text-[12px] font-bold text-[#484848]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Templates Gallery */}
                <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                  <h2 className="m-0 text-[18px] font-extrabold text-black">
                    💌 Fan Letter Stationery Templates ({templates.length})
                  </h2>
                  <div className="mt-[16px] grid grid-cols-3 gap-[14px] max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex flex-col overflow-hidden rounded-[14px] border border-black/[0.08] bg-[#f7f8fa]"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              tpl.imageUrl ||
                              "/sites/weverse/artists/kep1er-logo.webp"
                            }
                            alt={`Template #${tpl.id}`}
                            className="h-full w-full object-cover"
                          />
                          <span
                            className={`absolute left-[10px] top-[10px] rounded-full px-[9px] py-[3px] text-[10px] font-extrabold ${
                              tpl.isActive
                                ? "bg-[#00cbd5] text-white"
                                : "bg-black/75 text-white"
                            }`}
                          >
                            {tpl.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                          <span
                            className={`absolute right-[10px] top-[10px] rounded-full px-[9px] py-[3px] text-[10px] font-extrabold ${
                              tpl.isPremium
                                ? "bg-[#7c3aed] text-white"
                                : "bg-white/90 text-black"
                            }`}
                          >
                            {tpl.isPremium
                              ? `💎 ${tpl.price} Jelly`
                              : "FREE"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-[6px] p-[12px]">
                          <button
                            type="button"
                            onClick={() => void handleToggleTemplateStatus(tpl)}
                            className="rounded-full bg-white px-[10px] py-[5px] text-[11px] font-bold text-[#333333] shadow-sm hover:bg-[#ebedf2]"
                          >
                            {tpl.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <div className="flex items-center gap-[6px]">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTemplate(tpl);
                                setTplImageUrl(tpl.imageUrl || "");
                                setTplIsPremium(tpl.isPremium);
                                setTplPrice(tpl.price);
                                setTplIsActive(tpl.isActive);
                              }}
                              className="rounded-[6px] bg-white px-[8px] py-[4px] text-[11px] font-bold text-[#333333] shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteTemplate(tpl.id)}
                              className="rounded-[6px] bg-[#fff2f2] px-[8px] py-[4px] text-[11px] font-bold text-[#d63333]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 5: CONTENT & USER MODERATION                                  */}
            {/* ================================================================= */}
            {activeTab === "moderation" && (
              <div className="space-y-[18px]">
                {/* Sub-Tab Selector */}
                <div className="flex flex-wrap items-center justify-between gap-[12px] rounded-[18px] border border-black/[0.06] bg-white p-[18px] shadow-sm">
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <button
                      type="button"
                      onClick={() => setModerationTab("posts")}
                      className={`rounded-full px-[16px] py-[8px] text-[13px] font-extrabold ${
                        moderationTab === "posts"
                          ? "bg-black text-white"
                          : "bg-[#f2f4f8] text-[#484848]"
                      }`}
                    >
                      📝 Community Posts Moderation ({adminPosts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setModerationTab("users")}
                      className={`rounded-full px-[16px] py-[8px] text-[13px] font-extrabold ${
                        moderationTab === "users"
                          ? "bg-black text-white"
                          : "bg-[#f2f4f8] text-[#484848]"
                      }`}
                    >
                      👥 User Accounts &amp; Access ({adminUsers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setModerationTab("fan-letters")}
                      className={`rounded-full px-[16px] py-[8px] text-[13px] font-extrabold ${
                        moderationTab === "fan-letters"
                          ? "bg-black text-white"
                          : "bg-[#f2f4f8] text-[#484848]"
                      }`}
                    >
                      💌 Fan Letters Moderation ({adminLetters.length})
                    </button>
                  </div>

                  {/* Contextual Filters */}
                  {moderationTab === "posts" && (
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <select
                        value={postFandomFilter}
                        onChange={(e) =>
                          setPostFandomFilter(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Communities</option>
                        {fandoms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={postStatusFilter}
                        onChange={(e) => setPostStatusFilter(e.target.value)}
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="HIDDEN">Hidden</option>
                        <option value="DELETED">Deleted</option>
                      </select>
                    </div>
                  )}

                  {moderationTab === "users" && (
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="h-[36px] rounded-full border border-black/15 bg-[#f7f8fa] px-[14px] text-[12px] text-black outline-none"
                      />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Roles</option>
                        <option value="FAN">Fans</option>
                        <option value="ARTIST">Artists</option>
                        <option value="ADMIN">Admins</option>
                      </select>
                    </div>
                  )}

                  {moderationTab === "fan-letters" && (
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <select
                        value={letterArtistFilter}
                        onChange={(e) =>
                          setLetterArtistFilter(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Recipient Artists</option>
                        {artists.map((a) => (
                          <option key={a.userId} value={a.userId}>
                            To. {a.stageName}
                          </option>
                        ))}
                      </select>
                      <select
                        value={letterStatusFilter}
                        onChange={(e) => setLetterStatusFilter(e.target.value)}
                        className="h-[36px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="HIDDEN">Hidden</option>
                        <option value="DELETED">Deleted</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 5A. COMMUNITY POSTS MODERATION TABLE */}
                {moderationTab === "posts" && (
                  <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                    <div className="space-y-[12px]">
                      {adminPosts.length === 0 ? (
                        <p className="m-0 py-[28px] text-center text-[14px] text-[#8e8e8e]">
                          No posts match the selected filter.
                        </p>
                      ) : (
                        adminPosts.map((post) => (
                          <div
                            key={post.id}
                            className="flex flex-wrap items-start justify-between gap-[14px] rounded-[14px] border border-black/[0.06] bg-[#f7f8fa] p-[16px]"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-[8px]">
                                <Link
                                  href={`/users/${post.author?.id ?? ""}`}
                                  className="text-[14px] font-extrabold text-black no-underline hover:underline"
                                >
                                  {post.author?.stageName || post.author?.name}
                                </Link>
                                {post.artistPost ? (
                                  <span className="rounded-[4px] bg-[#dffafb] px-[6px] py-[2px] text-[10px] font-extrabold text-[#008b94]">
                                    ARTIST
                                  </span>
                                ) : (
                                  <span className="rounded-[4px] bg-[#f3e8ff] px-[6px] py-[2px] text-[10px] font-bold text-[#7c3aed]">
                                    FAN
                                  </span>
                                )}
                                {post.fandomName && (
                                  <span className="rounded-full bg-white px-[10px] py-[2px] text-[11px] font-bold text-[#008b94]">
                                    in {post.fandomName}
                                  </span>
                                )}
                                <span
                                  className={`rounded-full px-[9px] py-[2px] text-[10px] font-extrabold ${
                                    post.status === "PUBLISHED"
                                      ? "bg-[#dcfce7] text-[#15803d]"
                                      : post.status === "HIDDEN"
                                        ? "bg-[#fef3c7] text-[#b45309]"
                                        : "bg-[#fee2e2] text-[#b91c1c]"
                                  }`}
                                >
                                  {post.status}
                                </span>
                                <span className="text-[11px] text-[#8e8e8e]">
                                  {formatDateTime(post.createdAt)}
                                </span>
                              </div>

                              <p className="mb-0 mt-[8px] whitespace-pre-line text-[13px] leading-[19px] text-[#222222]">
                                {post.content}
                              </p>

                              <div className="mt-[8px] flex items-center gap-[14px] text-[11px] font-semibold text-[#666666]">
                                <span>❤️ {post.totalReactions} likes</span>
                                <span>💬 {post.totalComments} comments</span>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-[6px]">
                              {post.status !== "PUBLISHED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangePostStatus(
                                      post,
                                      "PUBLISHED"
                                    )
                                  }
                                  className="rounded-full bg-[#00cbd5] px-[12px] py-[6px] text-[11px] font-extrabold text-white hover:bg-[#00b8c1]"
                                >
                                  ✓ Restore / Publish
                                </button>
                              )}
                              {post.status !== "HIDDEN" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangePostStatus(post, "HIDDEN")
                                  }
                                  className="rounded-full bg-[#fff3e0] px-[12px] py-[6px] text-[11px] font-extrabold text-[#d97706] hover:bg-[#ffe4b5]"
                                >
                                  👁️‍🗨️ Hide Post
                                </button>
                              )}
                              {post.status !== "DELETED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangePostStatus(post, "DELETED")
                                  }
                                  className="rounded-full bg-[#fff2f2] px-[12px] py-[6px] text-[11px] font-extrabold text-[#d63333] hover:bg-[#ffe0e0]"
                                >
                                  🗑️ Mark Deleted
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {/* 5B. USER ACCOUNTS MODERATION */}
                {moderationTab === "users" && (
                  <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                    <div className="grid grid-cols-2 gap-[12px] max-[860px]:grid-cols-1">
                      {filteredUsers.map((u) => {
                        const active = u.isActive !== false;
                        const isSelf = u.id === user?.id;
                        return (
                          <div
                            key={u.id}
                            className="flex items-center justify-between gap-[12px] rounded-[14px] border border-black/[0.06] bg-[#f7f8fa] p-[14px]"
                          >
                            <Link
                              href={`/users/${u.id}`}
                              className="flex min-w-0 items-center gap-[12px] text-black no-underline"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  u.artistProfile?.avatar ||
                                  u.avatar ||
                                  "/sites/weverse/artists/kep1er-logo.webp"
                                }
                                alt={u.name}
                                className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-[6px]">
                                  <strong className="truncate text-[14px] font-extrabold text-black hover:underline">
                                    {u.artistProfile?.stageName || u.name}
                                  </strong>
                                  <span
                                    className={`rounded-[4px] px-[6px] py-[1px] text-[9px] font-extrabold ${
                                      u.role === "ADMIN"
                                        ? "bg-[#121c2e] text-[#00cbd5]"
                                        : u.role === "ARTIST"
                                          ? "bg-[#dffafb] text-[#008b94]"
                                          : "bg-[#f3e8ff] text-[#7c3aed]"
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                  <span
                                    className={`rounded-full px-[8px] py-[1px] text-[9px] font-extrabold ${
                                      active
                                        ? "bg-[#dcfce7] text-[#15803d]"
                                        : "bg-[#fee2e2] text-[#b91c1c]"
                                    }`}
                                  >
                                    {active ? "ACTIVE" : "SUSPENDED"}
                                  </span>
                                </div>
                                <span className="block truncate text-[11px] text-[#666666]">
                                  {u.email} ·{" "}
                                  {(u.totalFollower ?? 0).toLocaleString()}{" "}
                                  followers
                                </span>
                              </div>
                            </Link>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => void handleToggleUserActive(u)}
                                className={`shrink-0 rounded-full px-[14px] py-[6px] text-[11px] font-extrabold transition-colors ${
                                  active
                                    ? "bg-[#fff2f2] text-[#d63333] hover:bg-[#ffe0e0]"
                                    : "bg-[#00cbd5] text-white hover:bg-[#00b8c1]"
                                }`}
                              >
                                {active ? "🚫 Suspend User" : "✓ Reactivate"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 5C. FAN LETTERS MODERATION */}
                {moderationTab === "fan-letters" && (
                  <section className="rounded-[18px] border border-black/[0.06] bg-white p-[22px] shadow-sm">
                    <div className="space-y-[12px]">
                      {adminLetters.length === 0 ? (
                        <p className="m-0 py-[28px] text-center text-[14px] text-[#8e8e8e]">
                          No fan letters match the selected filter.
                        </p>
                      ) : (
                        adminLetters.map((letter) => (
                          <div
                            key={letter.id}
                            className="flex flex-wrap items-start justify-between gap-[14px] rounded-[14px] border border-black/[0.06] bg-[#fce8ee]/45 p-[16px]"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-[8px]">
                                <strong className="text-[13px] font-extrabold text-black">
                                  From: {letter.sender?.name}
                                </strong>
                                <span className="text-[12px] font-bold text-[#d6335a]">
                                  → To. {letter.recipient?.stageName}
                                </span>
                                <span className="rounded-[4px] bg-white px-[6px] py-[1px] text-[10px] font-bold text-[#484848]">
                                  {letter.isPublic
                                    ? "🌐 Public Wall"
                                    : "🔒 Private"}
                                </span>
                                <span
                                  className={`rounded-full px-[9px] py-[2px] text-[10px] font-extrabold ${
                                    letter.status === "PUBLISHED"
                                      ? "bg-[#dcfce7] text-[#15803d]"
                                      : letter.status === "HIDDEN"
                                        ? "bg-[#fef3c7] text-[#b45309]"
                                        : "bg-[#fee2e2] text-[#b91c1c]"
                                  }`}
                                >
                                  {letter.status}
                                </span>
                                <span className="text-[11px] text-[#8e8e8e]">
                                  {formatDateTime(letter.createdAt)}
                                </span>
                              </div>

                              <p className="mb-0 mt-[8px] whitespace-pre-line text-[13px] leading-[19px] text-[#222222]">
                                {letter.content}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-[6px]">
                              {letter.status !== "PUBLISHED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangeLetterStatus(
                                      letter,
                                      "PUBLISHED"
                                    )
                                  }
                                  className="rounded-full bg-[#00cbd5] px-[12px] py-[6px] text-[11px] font-extrabold text-white"
                                >
                                  ✓ Restore
                                </button>
                              )}
                              {letter.status !== "HIDDEN" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangeLetterStatus(
                                      letter,
                                      "HIDDEN"
                                    )
                                  }
                                  className="rounded-full bg-[#fff3e0] px-[12px] py-[6px] text-[11px] font-extrabold text-[#d97706]"
                                >
                                  👁️‍🗨️ Hide Letter
                                </button>
                              )}
                              {letter.status !== "DELETED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleChangeLetterStatus(
                                      letter,
                                      "DELETED"
                                    )
                                  }
                                  className="rounded-full bg-[#fff2f2] px-[12px] py-[6px] text-[11px] font-extrabold text-[#d63333]"
                                >
                                  🗑️ Mark Deleted
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
            </div>
          </>
        )}

        <div className="mt-[48px]">
          <WeverseFooter onOpenCookieSettings={openCookieModal} />
        </div>
      </main>

      {/* Community Roster & Member Roles Modal */}
      {managingFandom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Manage ${managingFandom.name} Artists and Members`}
          className="fixed inset-0 z-[175] flex items-center justify-center bg-black/55 px-[16px]"
          onClick={() => setManagingFandom(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-[780px] overflow-y-auto rounded-[22px] bg-white p-[24px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-[14px]">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008b94]">
                  COMMUNITY ROSTER &amp; PERMISSIONS
                </span>
                <h2 className="m-0 text-[20px] font-extrabold text-black">
                  🏛️ {managingFandom.name} — Official Artists &amp; Member Roles
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setManagingFandom(null)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-black hover:bg-black/[0.05]"
              >
                <CloseIcon className="h-[20px] w-[20px]" />
              </button>
            </div>

            {loadingRoster ? (
              <p className="m-0 py-[32px] text-center text-[14px] text-[#8e8e8e]">
                Loading community roster and members...
              </p>
            ) : (
              <div className="mt-[16px] space-y-[20px]">
                {/* Section 1: Assigned Official Artists */}
                <div className="rounded-[16px] bg-[#f7f8fa] p-[16px]">
                  <div className="flex flex-wrap items-center justify-between gap-[10px]">
                    <h3 className="m-0 text-[15px] font-extrabold text-black">
                      🎤 Assigned Official Artists (
                      {managingFandomDetail?.artists?.length ?? 0})
                    </h3>

                    <form
                      onSubmit={(e) => void handleAssignArtistToFandom(e)}
                      className="flex items-center gap-[8px]"
                    >
                      <select
                        value={assignArtistId}
                        onChange={(e) =>
                          setAssignArtistId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="h-[34px] rounded-full border border-black/15 bg-white px-[12px] text-[12px] font-semibold text-black outline-none"
                      >
                        <option value="">+ Select Artist to Assign...</option>
                        {artists.map((a) => (
                          <option key={a.userId} value={a.userId}>
                            {a.stageName} ({a.company?.name || "Weverse"})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={assignArtistId === ""}
                        className="h-[34px] rounded-full bg-[#00cbd5] px-[14px] text-[12px] font-extrabold text-white disabled:opacity-50"
                      >
                        Assign to {managingFandom.name}
                      </button>
                    </form>
                  </div>

                  <div className="mt-[12px] flex flex-wrap gap-[8px]">
                    {(managingFandomDetail?.artists ?? []).length === 0 ? (
                      <span className="text-[12px] text-[#8e8e8e]">
                        No artists assigned to this community yet.
                      </span>
                    ) : (
                      (managingFandomDetail?.artists ?? []).map((art) => (
                        <div
                          key={art.userId}
                          className="inline-flex items-center gap-[8px] rounded-full border border-[#00cbd5]/50 bg-white px-[12px] py-[6px]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              art.avatar ||
                              "/sites/weverse/artists/kep1er-logo.webp"
                            }
                            alt={art.stageName}
                            className="h-[24px] w-[24px] rounded-full object-cover"
                          />
                          <strong className="text-[12px] font-extrabold text-black">
                            {art.stageName}
                          </strong>
                          <button
                            type="button"
                            onClick={() =>
                              void handleRemoveArtistFromFandom(art.userId)
                            }
                            className="rounded-full bg-[#fff2f2] px-[7px] py-[1px] text-[10px] font-bold text-[#d63333] hover:bg-[#ffe0e0]"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 2: Community Members & Role Assignment */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-[10px]">
                    <h3 className="m-0 text-[15px] font-extrabold text-black">
                      👥 Community Members ({fandomMembers.length})
                    </h3>
                    <div className="flex items-center gap-[6px]">
                      {(
                        [
                          { id: "", label: "All Roles" },
                          { id: "MEMBER", label: "Member" },
                          { id: "VIP_MEMBER", label: "VIP Member" },
                          { id: "MODERATOR", label: "Moderator" },
                          { id: "ARTIST", label: "Artist" },
                        ] as const
                      ).map((r) => (
                        <button
                          key={r.id || "ALL"}
                          type="button"
                          onClick={() =>
                            void openFandomRosterManager(managingFandom, r.id)
                          }
                          className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                            memberRoleFilter === r.id
                              ? "bg-black text-white"
                              : "bg-[#f2f4f8] text-[#484848]"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-[12px] space-y-[8px]">
                    {fandomMembers.length === 0 ? (
                      <p className="m-0 py-[20px] text-center text-[13px] text-[#8e8e8e]">
                        No members found for this role filter.
                      </p>
                    ) : (
                      fandomMembers.map((m) => (
                        <div
                          key={m.membershipId}
                          className="flex flex-wrap items-center justify-between gap-[10px] rounded-[12px] border border-black/[0.06] bg-[#f7f8fa] px-[14px] py-[10px]"
                        >
                          <div className="flex items-center gap-[10px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                m.avatar ||
                                "/sites/weverse/artists/kep1er-logo.webp"
                              }
                              alt={m.name}
                              className="h-[36px] w-[36px] rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-[6px]">
                                <strong className="text-[13px] font-bold text-black">
                                  {m.name}
                                </strong>
                                {m.verified && (
                                  <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                                )}
                                <span className="rounded-[4px] bg-white px-[6px] py-[1px] text-[10px] font-extrabold text-[#008b94]">
                                  {m.fandomRole}
                                </span>
                              </div>
                              <span className="block text-[11px] text-[#8e8e8e]">
                                Joined {formatDateTime(m.joinedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-[8px]">
                            <select
                              aria-label={`Change ${m.name} community role`}
                              value={m.fandomRole}
                              onChange={(e) =>
                                void handleUpdateMemberRole(
                                  m,
                                  e.target.value as
                                    | "MEMBER"
                                    | "VIP_MEMBER"
                                    | "ARTIST"
                                    | "MODERATOR"
                                )
                              }
                              className="h-[30px] rounded-[8px] border border-black/15 bg-white px-[8px] text-[11px] font-bold text-black outline-none"
                            >
                              <option value="MEMBER">Member</option>
                              <option value="VIP_MEMBER">👑 VIP Member</option>
                              <option value="MODERATOR">🛡️ Moderator</option>
                              <option value="ARTIST">🎤 Artist</option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                void handleRemoveMemberFromFandom(m)
                              }
                              className="rounded-[8px] bg-[#fff2f2] px-[10px] py-[5px] text-[11px] font-bold text-[#d63333] hover:bg-[#ffe0e0]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
