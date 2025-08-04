import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader,
  Mail,
  Phone,
  RefreshCw,
  Search,
  StopCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ApiStatus {
  refreshTokenRequired: boolean;
  lastChecked: Date;
  isLoading: boolean;
  error: string | null;
}

interface CRELead {
  row_number: number;
  "Stop outreach": boolean | string;
  FirstName: string;
  LastName: string;
  Title: string;
  Email: string;
  CompanySize: string;
  LinkedIn: string;
  Organization: string;
  OrganizationLinkedIn: string;
  OrganizationSite: string;
  Industry: string;
  Phone: number | string;
  "Total Entries": number;
  STATUS: string;
  LAST_TOUCH: string;
  TOUCH_COUNT: string;
  NEXT_TOUCH_DATE: string;
  TOUCHPOINT: number;
}

interface CRELeadsState {
  leads: CRELead[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface RealtorLeadsState {
  leads: CRELead[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface LoanOfficerLeadsState {
  leads: CRELead[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    refreshTokenRequired: false,
    lastChecked: new Date(),
    isLoading: false,
    error: null,
  });

  const [creLeads, setCRELeads] = useState<CRELeadsState>({
    leads: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  });

  const [realtorLeads, setRealtorLeads] = useState<RealtorLeadsState>({
    leads: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  });

  const [loanOfficerLeads, setLoanOfficerLeads] =
    useState<LoanOfficerLeadsState>({
      leads: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

  const [commercialBankersLeads, setCommercialBankersLeads] =
    useState<LoanOfficerLeadsState>({
      leads: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

  const [residentialRealtorsLeads, setResidentialRealtorsLeads] =
    useState<LoanOfficerLeadsState>({
      leads: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

  const [stoppingOutreach, setStoppingOutreach] = useState<Set<string>>(
    new Set()
  );
  const [stoppingRealtorOutreach, setStoppingRealtorOutreach] = useState<
    Set<string>
  >(new Set());
  const [stoppingLoanOfficerOutreach, setStoppingLoanOfficerOutreach] =
    useState<Set<string>>(new Set());
  const [
    stoppingCommercialBankersOutreach,
    setStoppingCommercialBankersOutreach,
  ] = useState<Set<string>>(new Set());
  const [
    stoppingResidentialRealtorsOutreach,
    setStoppingResidentialRealtorsOutreach,
  ] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<
    | "cre"
    | "realtor"
    | "loanOfficer"
    | "commercialBankers"
    | "residentialRealtors"
  >("cre");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRealtorPage, setCurrentRealtorPage] = useState(1);
  const [currentLoanOfficerPage, setCurrentLoanOfficerPage] = useState(1);
  const [currentCommercialBankersPage, setCurrentCommercialBankersPage] =
    useState(1);
  const [currentResidentialRealtorsPage, setCurrentResidentialRealtorsPage] =
    useState(1);
  const itemsPerPage = 10;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [realtorSearchTerm, setRealtorSearchTerm] = useState("");
  const [loanOfficerSearchTerm, setLoanOfficerSearchTerm] = useState("");
  const [commercialBankersSearchTerm, setCommercialBankersSearchTerm] =
    useState("");
  const [residentialRealtorsSearchTerm, setResidentialRealtorsSearchTerm] =
    useState("");
  const [outreachFilter, setOutreachFilter] = useState<
    "all" | "running" | "stopped"
  >("all");
  const [realtorOutreachFilter, setRealtorOutreachFilter] = useState<
    "all" | "running" | "stopped"
  >("all");
  const [loanOfficerOutreachFilter, setLoanOfficerOutreachFilter] = useState<
    "all" | "running" | "stopped"
  >("all");
  const [commercialBankersOutreachFilter, setCommercialBankersOutreachFilter] =
    useState<"all" | "running" | "stopped">("all");
  const [
    residentialRealtorsOutreachFilter,
    setResidentialRealtorsOutreachFilter,
  ] = useState<"all" | "running" | "stopped">("all");

  const webhookUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/f4317593-ce16-43c6-a49f-1691901e3d8a";
  const creLeadsUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/1323c7c6-ff15-460e-918f-32a351260454";
  const stopOutreachUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/3216320e-eeba-445c-8a00-5a3df6f3d135";
  const realtorLeadsUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/d1090821-d8f0-47e8-bce5-1f9675ade942";
  const stopRealtorOutreachUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/21c78aa9-bd11-489b-ab9b-49e89e1b5eb2";
  const loanOfficerLeadsUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/7c7316b8-0df6-422a-b97c-6d4c67b8d950";
  const stopLoanOfficerOutreachUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/1ea4ba2d-9c26-427b-84a8-2b635234e9c5";
  const commercialBankersLendersLeadsUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/bc91ffc9-5e4c-4099-934c-fb71dfae45a5";
  const stopCommercialBankersLendersOutreachUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/3fcabafe-f606-4139-868a-8045f5ae769b";
  const residentialRealtorsLoanOfficersLeadsUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/0bf51d89-bd1b-438c-92ef-98cf874f3817";
  const stopResidentialRealtorsLoanOfficersOutreachUrl =
    "https://n8n.srv834400.hstgr.cloud/webhook/66a76144-8a25-42c7-a74a-9a0a99827936";

  const fetchApiStatus = async () => {
    setApiStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(webhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setApiStatus({
        refreshTokenRequired: data.refreshTokenRequired || false,
        lastChecked: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching API status:", error);
      setApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  };

  const fetchCRELeads = async () => {
    setCRELeads((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(creLeadsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setCRELeads({
        leads: data,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching CRE leads:", error);
      setCRELeads((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch CRE leads",
      }));
    }
  };

  const fetchRealtorLeads = async () => {
    setRealtorLeads((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(realtorLeadsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setRealtorLeads({
        leads: data,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching Realtor leads:", error);
      setRealtorLeads((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Realtor leads",
      }));
    }
  };

  const fetchLoanOfficerLeads = async () => {
    setLoanOfficerLeads((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(loanOfficerLeadsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setLoanOfficerLeads({
        leads: data,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching Loan Officer leads:", error);
      setLoanOfficerLeads((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Loan Officer leads",
      }));
    }
  };

  const fetchCommercialBankersLeads = async () => {
    setCommercialBankersLeads((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(commercialBankersLendersLeadsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Commercial Bankers raw data:", data);

      // Handle different data structures
      const leads = Array.isArray(data) ? data : data.leads || data.data || [];
      console.log("Commercial Bankers processed leads:", leads);

      setCommercialBankersLeads({
        leads: leads,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching Commercial Bankers leads:", error);
      setCommercialBankersLeads((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Commercial Bankers leads",
      }));
    }
  };

  const fetchResidentialRealtorsLeads = async () => {
    setResidentialRealtorsLeads((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(residentialRealtorsLoanOfficersLeadsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Residential Realtors raw data:", data);

      // Handle different data structures
      const leads = Array.isArray(data) ? data : data.leads || data.data || [];
      console.log("Residential Realtors processed leads:", leads);

      setResidentialRealtorsLeads({
        leads: leads,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching Residential Realtors leads:", error);
      setResidentialRealtorsLeads((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Residential Realtors leads",
      }));
    }
  };

  const stopOutreach = async (email: string, leadName: string) => {
    if (!email) {
      alert("No email address available for this lead");
      return;
    }

    const confirmStop = window.confirm(
      `Are you sure you want to stop outreach for ${leadName}?\n\nEmail: ${email}\n\nThis action will halt all future email campaigns for this lead.`
    );

    if (!confirmStop) return;

    setStoppingOutreach((prev) => new Set(prev).add(email));

    try {
      const response = await fetch(stopOutreachUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setCRELeads((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.Email === email ? { ...lead, "Stop outreach": true } : lead
        ),
      }));

      // Show success message
      alert(`Outreach stopped successfully for ${leadName}`);
    } catch (error) {
      console.error("Error stopping outreach:", error);
      alert(`Failed to stop outreach for ${leadName}. Please try again.`);
    } finally {
      setStoppingOutreach((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const stopRealtorOutreach = async (email: string, leadName: string) => {
    if (!email) {
      alert("No email address available for this lead");
      return;
    }

    const confirmStop = window.confirm(
      `Are you sure you want to stop outreach for ${leadName}?\n\nEmail: ${email}\n\nThis action will halt all future email campaigns for this lead.`
    );

    if (!confirmStop) return;

    setStoppingRealtorOutreach((prev) => new Set(prev).add(email));

    try {
      const response = await fetch(stopRealtorOutreachUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setRealtorLeads((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.Email === email ? { ...lead, "Stop outreach": true } : lead
        ),
      }));

      // Show success message
      alert(`Outreach stopped successfully for ${leadName}`);
    } catch (error) {
      console.error("Error stopping outreach:", error);
      alert(`Failed to stop outreach for ${leadName}. Please try again.`);
    } finally {
      setStoppingRealtorOutreach((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const stopLoanOfficerOutreach = async (email: string, leadName: string) => {
    if (!email) {
      alert("No email address available for this lead");
      return;
    }

    const confirmStop = window.confirm(
      `Are you sure you want to stop outreach for ${leadName}?\n\nEmail: ${email}\n\nThis action will halt all future email campaigns for this lead.`
    );

    if (!confirmStop) return;

    setStoppingLoanOfficerOutreach((prev) => new Set(prev).add(email));

    try {
      const response = await fetch(stopLoanOfficerOutreachUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setLoanOfficerLeads((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.Email === email ? { ...lead, "Stop outreach": true } : lead
        ),
      }));

      // Show success message
      alert(`Outreach stopped successfully for ${leadName}`);
    } catch (error) {
      console.error("Error stopping outreach:", error);
      alert(`Failed to stop outreach for ${leadName}. Please try again.`);
    } finally {
      setStoppingLoanOfficerOutreach((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const stopCommercialBankersOutreach = async (
    email: string,
    leadName: string
  ) => {
    const confirmStop = window.confirm(
      `Are you sure you want to stop outreach for ${leadName}?\n\nEmail: ${email}\n\nThis action will halt all future email campaigns for this lead.`
    );

    if (!confirmStop) return;

    setStoppingCommercialBankersOutreach((prev) => new Set(prev).add(email));

    try {
      const response = await fetch(stopCommercialBankersLendersOutreachUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setCommercialBankersLeads((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.Email === email ? { ...lead, "Stop outreach": true } : lead
        ),
      }));

      // Show success message
      alert(`Outreach stopped successfully for ${leadName}`);
    } catch (error) {
      console.error("Error stopping outreach:", error);
      alert(`Failed to stop outreach for ${leadName}. Please try again.`);
    } finally {
      setStoppingCommercialBankersOutreach((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const stopResidentialRealtorsOutreach = async (
    email: string,
    leadName: string
  ) => {
    const confirmStop = window.confirm(
      `Are you sure you want to stop outreach for ${leadName}?\n\nEmail: ${email}\n\nThis action will halt all future email campaigns for this lead.`
    );

    if (!confirmStop) return;

    setStoppingResidentialRealtorsOutreach((prev) => new Set(prev).add(email));

    try {
      const response = await fetch(
        stopResidentialRealtorsLoanOfficersOutreachUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setResidentialRealtorsLeads((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) =>
          lead.Email === email ? { ...lead, "Stop outreach": true } : lead
        ),
      }));

      // Show success message
      alert(`Outreach stopped successfully for ${leadName}`);
    } catch (error) {
      console.error("Error stopping outreach:", error);
      alert(`Failed to stop outreach for ${leadName}. Please try again.`);
    } finally {
      setStoppingResidentialRealtorsOutreach((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  // Search and filter functions
  const filterLeads = (
    leads: CRELead[],
    searchTerm: string,
    outreachFilter: "all" | "running" | "stopped"
  ) => {
    return leads.filter((lead) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        lead.FirstName.toLowerCase().includes(searchLower) ||
        lead.LastName.toLowerCase().includes(searchLower) ||
        lead.Email.toLowerCase().includes(searchLower) ||
        lead.Phone.toString().includes(searchTerm) ||
        `${lead.FirstName} ${lead.LastName}`
          .toLowerCase()
          .includes(searchLower);

      // Outreach filter
      const isStopped =
        lead["Stop outreach"] === true || lead["Stop outreach"] === "true";
      const matchesOutreachFilter =
        outreachFilter === "all" ||
        (outreachFilter === "stopped" && isStopped) ||
        (outreachFilter === "running" && !isStopped);

      return matchesSearch && matchesOutreachFilter;
    });
  };

  // Filter leads for each section
  const filteredCRELeads = filterLeads(
    creLeads.leads,
    searchTerm,
    outreachFilter
  );
  const filteredRealtorLeads = filterLeads(
    realtorLeads.leads,
    realtorSearchTerm,
    realtorOutreachFilter
  );
  const filteredLoanOfficerLeads = filterLeads(
    loanOfficerLeads?.leads && Array.isArray(loanOfficerLeads.leads)
      ? loanOfficerLeads.leads
      : [],
    loanOfficerSearchTerm,
    loanOfficerOutreachFilter
  );
  const filteredCommercialBankersLeads = filterLeads(
    commercialBankersLeads?.leads && Array.isArray(commercialBankersLeads.leads)
      ? commercialBankersLeads.leads
      : [],
    commercialBankersSearchTerm,
    commercialBankersOutreachFilter
  );
  console.log("Commercial Bankers state:", {
    leads: commercialBankersLeads?.leads?.length,
    filtered: filteredCommercialBankersLeads.length,
    searchTerm: commercialBankersSearchTerm,
    filter: commercialBankersOutreachFilter,
  });

  const filteredResidentialRealtorsLeads = filterLeads(
    residentialRealtorsLeads?.leads &&
      Array.isArray(residentialRealtorsLeads.leads)
      ? residentialRealtorsLeads.leads
      : [],
    residentialRealtorsSearchTerm,
    residentialRealtorsOutreachFilter
  );
  console.log("Residential Realtors state:", {
    leads: residentialRealtorsLeads?.leads?.length,
    filtered: filteredResidentialRealtorsLeads.length,
    searchTerm: residentialRealtorsSearchTerm,
    filter: residentialRealtorsOutreachFilter,
  });

  // Calculate pagination
  const totalItems = filteredCRELeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredCRELeads.slice(startIndex, endIndex);

  // Calculate realtor pagination
  const totalRealtorItems = filteredRealtorLeads.length;
  const totalRealtorPages = Math.ceil(totalRealtorItems / itemsPerPage);
  const startRealtorIndex = (currentRealtorPage - 1) * itemsPerPage;
  const endRealtorIndex = startRealtorIndex + itemsPerPage;
  const currentRealtorLeads = filteredRealtorLeads.slice(
    startRealtorIndex,
    endRealtorIndex
  );

  // Calculate loan officer pagination
  const totalLoanOfficerItems = filteredLoanOfficerLeads.length;
  const totalLoanOfficerPages = Math.ceil(totalLoanOfficerItems / itemsPerPage);
  const startLoanOfficerIndex = (currentLoanOfficerPage - 1) * itemsPerPage;
  const endLoanOfficerIndex = startLoanOfficerIndex + itemsPerPage;
  const currentLoanOfficerLeads = filteredLoanOfficerLeads.slice(
    startLoanOfficerIndex,
    endLoanOfficerIndex
  );

  // Calculate commercial bankers pagination
  const totalCommercialBankersItems = filteredCommercialBankersLeads.length;
  const totalCommercialBankersPages = Math.ceil(
    totalCommercialBankersItems / itemsPerPage
  );
  const startCommercialBankersIndex =
    (currentCommercialBankersPage - 1) * itemsPerPage;
  const endCommercialBankersIndex = startCommercialBankersIndex + itemsPerPage;
  const currentCommercialBankersLeads = filteredCommercialBankersLeads.slice(
    startCommercialBankersIndex,
    endCommercialBankersIndex
  );

  // Calculate residential realtors pagination
  const totalResidentialRealtorsItems = filteredResidentialRealtorsLeads.length;
  const totalResidentialRealtorsPages = Math.ceil(
    totalResidentialRealtorsItems / itemsPerPage
  );
  const startResidentialRealtorsIndex =
    (currentResidentialRealtorsPage - 1) * itemsPerPage;
  const endResidentialRealtorsIndex =
    startResidentialRealtorsIndex + itemsPerPage;
  const currentResidentialRealtorsLeads =
    filteredResidentialRealtorsLeads.slice(
      startResidentialRealtorsIndex,
      endResidentialRealtorsIndex
    );

  // Reset to first page when new data is loaded or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [creLeads.leads.length, searchTerm, outreachFilter]);

  useEffect(() => {
    setCurrentRealtorPage(1);
  }, [realtorLeads.leads.length, realtorSearchTerm, realtorOutreachFilter]);

  useEffect(() => {
    setCurrentLoanOfficerPage(1);
  }, [
    loanOfficerLeads.leads.length,
    loanOfficerSearchTerm,
    loanOfficerOutreachFilter,
  ]);

  useEffect(() => {
    setCurrentCommercialBankersPage(1);
  }, [
    commercialBankersLeads.leads.length,
    commercialBankersSearchTerm,
    commercialBankersOutreachFilter,
  ]);

  useEffect(() => {
    setCurrentResidentialRealtorsPage(1);
  }, [
    residentialRealtorsLeads.leads.length,
    residentialRealtorsSearchTerm,
    residentialRealtorsOutreachFilter,
  ]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const goToRealtorPage = (page: number) => {
    setCurrentRealtorPage(Math.max(1, Math.min(page, totalRealtorPages)));
  };

  const goToRealtorPrevious = () => {
    setCurrentRealtorPage((prev) => Math.max(1, prev - 1));
  };

  const goToRealtorNext = () => {
    setCurrentRealtorPage((prev) => Math.min(totalRealtorPages, prev + 1));
  };

  const goToLoanOfficerPage = (page: number) => {
    setCurrentLoanOfficerPage(
      Math.max(1, Math.min(page, totalLoanOfficerPages))
    );
  };

  const goToLoanOfficerPrevious = () => {
    setCurrentLoanOfficerPage((prev) => Math.max(1, prev - 1));
  };

  const goToLoanOfficerNext = () => {
    setCurrentLoanOfficerPage((prev) =>
      Math.min(totalLoanOfficerPages, prev + 1)
    );
  };

  const goToCommercialBankersPage = (page: number) => {
    setCurrentCommercialBankersPage(
      Math.max(1, Math.min(page, totalCommercialBankersPages))
    );
  };

  const goToCommercialBankersPrevious = () => {
    setCurrentCommercialBankersPage((prev) => Math.max(1, prev - 1));
  };

  const goToCommercialBankersNext = () => {
    setCurrentCommercialBankersPage((prev) =>
      Math.min(totalCommercialBankersPages, prev + 1)
    );
  };

  const goToResidentialRealtorsPage = (page: number) => {
    setCurrentResidentialRealtorsPage(
      Math.max(1, Math.min(page, totalResidentialRealtorsPages))
    );
  };

  const goToResidentialRealtorsPrevious = () => {
    setCurrentResidentialRealtorsPage((prev) => Math.max(1, prev - 1));
  };

  const goToResidentialRealtorsNext = () => {
    setCurrentResidentialRealtorsPage((prev) =>
      Math.min(totalResidentialRealtorsPages, prev + 1)
    );
  };

  // Initial fetch and setup interval for 5-minute polling
  useEffect(() => {
    fetchApiStatus();
    fetchCRELeads();
    fetchRealtorLeads();
    fetchLoanOfficerLeads();
    fetchCommercialBankersLeads();
    fetchResidentialRealtorsLeads();

    const interval = setInterval(() => {
      fetchApiStatus();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  const getStatusButton = () => {
    if (apiStatus.isLoading) {
      return (
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 disabled:opacity-70"
          disabled
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Checking Status...
        </button>
      );
    }

    if (apiStatus.error) {
      return (
        <button
          onClick={fetchApiStatus}
          className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-600"
        >
          <AlertCircle className="w-4 h-4" />
          Connection Error - Retry
        </button>
      );
    }

    if (apiStatus.refreshTokenRequired) {
      return (
        <button
          onClick={fetchApiStatus}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-red-600 shadow-lg"
        >
          <AlertCircle className="w-4 h-4" />
          Refresh Token Required
        </button>
      );
    }

    return (
      <button
        onClick={fetchApiStatus}
        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-green-600 shadow-lg"
      >
        <CheckCircle className="w-4 h-4" />
        Google API Active
      </button>
    );
  };

  const formatLastChecked = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPhone = (phone: number | string) => {
    if (!phone) return "N/A";
    const phoneStr = phone.toString();
    if (phoneStr.length === 11 && phoneStr.startsWith("1")) {
      return `+1 (${phoneStr.slice(1, 4)}) ${phoneStr.slice(
        4,
        7
      )}-${phoneStr.slice(7)}`;
    }
    return phoneStr;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          No Status
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        {status}
      </span>
    );
  };

  const getTouchpointBadge = (touchpoint: number) => {
    const colors = [
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ];

    const colorIndex = Math.min(touchpoint - 1, colors.length - 1);
    const colorClass =
      touchpoint > 0 ? colors[colorIndex] : "bg-gray-100 text-gray-600";

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}
      >
        Touch {touchpoint}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">
                  Real Estate Leads Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {getStatusButton()}
                  <div className="ml-3 text-xs text-gray-500">
                    Last checked: {formatLastChecked(apiStatus.lastChecked)}
                  </div>
                </div>

                {/* Clerk Authentication */}
                <SignedOut>
                  <div className="flex items-center space-x-2">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("cre")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "cre"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  SBA Leads ({totalItems || 0})
                </button>
                <button
                  onClick={() => setActiveTab("realtor")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "realtor"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Realtor Leads ({totalRealtorItems || 0})
                </button>
                <button
                  onClick={() => setActiveTab("loanOfficer")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "loanOfficer"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Loan Officer Leads ({totalLoanOfficerItems || 0})
                </button>
                <button
                  onClick={() => setActiveTab("commercialBankers")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "commercialBankers"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Commercial Bankers ({totalCommercialBankersItems || 0})
                </button>
                <button
                  onClick={() => setActiveTab("residentialRealtors")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "residentialRealtors"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Residential Realtors ({totalResidentialRealtorsItems || 0})
                </button>
              </nav>
            </div>
          </div>
          {/* Google API Status */}
        </div>
      </header>

      {/* Tab Content */}
      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "cre" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  CRE Leads
                </h2>
                <p className="text-sm text-gray-600">
                  Total: {totalItems || 0} leads
                </p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="cre-search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search by Name, Email, or Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="cre-search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search leads..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <label
                        htmlFor="cre-outreach-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outreach Status
                      </label>
                      <select
                        id="cre-outreach-filter"
                        value={outreachFilter}
                        onChange={(e) =>
                          setOutreachFilter(
                            e.target.value as "all" | "running" | "stopped"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Leads</option>
                        <option value="running">Running Outreach</option>
                        <option value="stopped">Stopped Outreach</option>
                      </select>
                    </div>
                  </div>
                </div>
                {creLeads.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading CRE leads...
                    </span>
                  </div>
                ) : creLeads.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{creLeads.error}</p>
                    <button
                      onClick={fetchCRELeads}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Industry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Next Touch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentLeads.map((lead, index) => (
                            <tr
                              key={lead.row_number}
                              className={`hover:bg-gray-50 transition-colors ${
                                lead["Stop outreach"]
                                  ? "bg-red-50 hover:bg-red-100"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {lead.FirstName.charAt(0)}
                                        {lead.LastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lead.FirstName} {lead.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                      {lead.Title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {lead.Organization}
                                </div>
                                {lead.OrganizationSite && (
                                  <a
                                    href={lead.OrganizationSite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                                  {lead.Industry || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="space-y-1">
                                  {lead.Email && (
                                    <div className="flex items-center">
                                      <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`mailto:${lead.Email}`}
                                        className="text-blue-600 hover:text-blue-800 truncate max-w-xs"
                                      >
                                        {lead.Email}
                                      </a>
                                    </div>
                                  )}
                                  {lead.Phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`tel:${lead.Phone}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {formatPhone(lead.Phone)}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                  {getStatusBadge(lead.STATUS)}
                                  {getTouchpointBadge(lead.TOUCHPOINT)}
                                  {lead["Stop outreach"] && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                      Stop Outreach
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                    {formatDate(lead.NEXT_TOUCH_DATE)}
                                  </div>
                                  {lead.LAST_TOUCH && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Last: {formatDate(lead.LAST_TOUCH)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  {lead.LinkedIn && (
                                    <a
                                      href={lead.LinkedIn}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-900 transition-colors"
                                      title="View LinkedIn Profile"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}

                                  {/* Stop Outreach Button */}
                                  {lead["Stop outreach"] ? (
                                    <div
                                      className="flex items-center text-red-600"
                                      title="Outreach stopped"
                                    >
                                      <StopCircle className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">
                                        Stopped
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="relative group">
                                      <button
                                        onClick={() =>
                                          stopOutreach(
                                            lead.Email,
                                            `${lead.FirstName} ${lead.LastName}`
                                          )
                                        }
                                        disabled={
                                          stoppingOutreach.has(lead.Email) ||
                                          !lead.Email
                                        }
                                        className="flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          !lead.Email
                                            ? "No email available"
                                            : "Stop outreach for this lead"
                                        }
                                      >
                                        {stoppingOutreach.has(lead.Email) ? (
                                          <>
                                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                                            Stopping...
                                          </>
                                        ) : (
                                          <>
                                            <StopCircle className="w-3 h-3 mr-1" />
                                            Stop
                                          </>
                                        )}
                                      </button>
                                      {!lead.Email && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                          No email available
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* CRE Pagination */}
                    {totalItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(endIndex, totalItems)}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">{totalItems}</span>{" "}
                              results
                            </span>
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {Array.from(
                                  { length: Math.min(5, totalPages) },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                          currentPage === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}

                                {totalPages > 5 &&
                                  currentPage < totalPages - 2 && (
                                    <>
                                      <span className="text-gray-500">...</span>
                                      <button
                                        onClick={() => goToPage(totalPages)}
                                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        {totalPages}
                                      </button>
                                    </>
                                  )}
                              </div>

                              <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "realtor" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Realtor Leads
                </h2>
                <p className="text-sm text-gray-600">
                  Total: {totalRealtorItems || 0} leads
                </p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="realtor-search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search by Name, Email, or Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="realtor-search"
                          value={realtorSearchTerm}
                          onChange={(e) => setRealtorSearchTerm(e.target.value)}
                          placeholder="Search leads..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <label
                        htmlFor="realtor-outreach-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outreach Status
                      </label>
                      <select
                        id="realtor-outreach-filter"
                        value={realtorOutreachFilter}
                        onChange={(e) =>
                          setRealtorOutreachFilter(
                            e.target.value as "all" | "running" | "stopped"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="all">All Leads</option>
                        <option value="running">Running Outreach</option>
                        <option value="stopped">Stopped Outreach</option>
                      </select>
                    </div>
                  </div>
                </div>
                {realtorLeads.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading Realtor leads...
                    </span>
                  </div>
                ) : realtorLeads.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{realtorLeads.error}</p>
                    <button
                      onClick={fetchRealtorLeads}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Industry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Next Touch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentRealtorLeads.map((lead, index) => (
                            <tr
                              key={lead.row_number}
                              className={`hover:bg-gray-50 transition-colors ${
                                lead["Stop outreach"]
                                  ? "bg-red-50 hover:bg-red-100"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {lead.FirstName.charAt(0)}
                                        {lead.LastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lead.FirstName} {lead.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                      {lead.Title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {lead.Organization}
                                </div>
                                {lead.OrganizationSite && (
                                  <a
                                    href={lead.OrganizationSite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:text-green-800 flex items-center mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                                  {lead.Industry || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="space-y-1">
                                  {lead.Email && (
                                    <div className="flex items-center">
                                      <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`mailto:${lead.Email}`}
                                        className="text-green-600 hover:text-green-800 truncate max-w-xs"
                                      >
                                        {lead.Email}
                                      </a>
                                    </div>
                                  )}
                                  {lead.Phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`tel:${lead.Phone}`}
                                        className="text-green-600 hover:text-green-800"
                                      >
                                        {formatPhone(lead.Phone)}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                  {getStatusBadge(lead.STATUS)}
                                  {getTouchpointBadge(lead.TOUCHPOINT)}
                                  {lead["Stop outreach"] && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                      Stop Outreach
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                    {formatDate(lead.NEXT_TOUCH_DATE)}
                                  </div>
                                  {lead.LAST_TOUCH && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Last: {formatDate(lead.LAST_TOUCH)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  {lead.LinkedIn && (
                                    <a
                                      href={lead.LinkedIn}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-900 transition-colors"
                                      title="View LinkedIn Profile"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}

                                  {/* Stop Outreach Button */}
                                  {lead["Stop outreach"] ? (
                                    <div
                                      className="flex items-center text-red-600"
                                      title="Outreach stopped"
                                    >
                                      <StopCircle className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">
                                        Stopped
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="relative group">
                                      <button
                                        onClick={() =>
                                          stopRealtorOutreach(
                                            lead.Email,
                                            `${lead.FirstName} ${lead.LastName}`
                                          )
                                        }
                                        disabled={
                                          stoppingRealtorOutreach.has(
                                            lead.Email
                                          ) || !lead.Email
                                        }
                                        className="flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          !lead.Email
                                            ? "No email available"
                                            : "Stop outreach for this lead"
                                        }
                                      >
                                        {stoppingRealtorOutreach.has(
                                          lead.Email
                                        ) ? (
                                          <>
                                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                                            Stopping...
                                          </>
                                        ) : (
                                          <>
                                            <StopCircle className="w-3 h-3 mr-1" />
                                            Stop
                                          </>
                                        )}
                                      </button>
                                      {!lead.Email && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                          No email available
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Realtor Pagination */}
                    {totalRealtorItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startRealtorIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(endRealtorIndex, totalRealtorItems)}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {totalRealtorItems}
                              </span>{" "}
                              results
                            </span>
                          </div>

                          {totalRealtorPages > 1 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToRealtorPrevious}
                                disabled={currentRealtorPage === 1}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {Array.from(
                                  { length: Math.min(5, totalRealtorPages) },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalRealtorPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentRealtorPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentRealtorPage >=
                                      totalRealtorPages - 2
                                    ) {
                                      pageNum = totalRealtorPages - 4 + i;
                                    } else {
                                      pageNum = currentRealtorPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => goToRealtorPage(pageNum)}
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                          currentRealtorPage === pageNum
                                            ? "bg-green-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}

                                {totalRealtorPages > 5 &&
                                  currentRealtorPage <
                                    totalRealtorPages - 2 && (
                                    <>
                                      <span className="text-gray-500">...</span>
                                      <button
                                        onClick={() =>
                                          goToRealtorPage(totalRealtorPages)
                                        }
                                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        {totalRealtorPages}
                                      </button>
                                    </>
                                  )}
                              </div>

                              <button
                                onClick={goToRealtorNext}
                                disabled={
                                  currentRealtorPage === totalRealtorPages
                                }
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "loanOfficer" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Loan Officer Leads
                </h2>
                <p className="text-sm text-gray-600">
                  Total: {totalLoanOfficerItems || 0} leads
                </p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="loan-officer-search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search by Name, Email, or Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="loan-officer-search"
                          value={loanOfficerSearchTerm}
                          onChange={(e) =>
                            setLoanOfficerSearchTerm(e.target.value)
                          }
                          placeholder="Search leads..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <label
                        htmlFor="loan-officer-outreach-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outreach Status
                      </label>
                      <select
                        id="loan-officer-outreach-filter"
                        value={loanOfficerOutreachFilter}
                        onChange={(e) =>
                          setLoanOfficerOutreachFilter(
                            e.target.value as "all" | "running" | "stopped"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="all">All Leads</option>
                        <option value="running">Running Outreach</option>
                        <option value="stopped">Stopped Outreach</option>
                      </select>
                    </div>
                  </div>
                </div>
                {loanOfficerLeads.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading Loan Officer leads...
                    </span>
                  </div>
                ) : loanOfficerLeads.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">
                      {loanOfficerLeads.error}
                    </p>
                    <button
                      onClick={fetchLoanOfficerLeads}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Industry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Next Touch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentLoanOfficerLeads.map((lead, index) => (
                            <tr
                              key={lead.row_number}
                              className={`hover:bg-gray-50 transition-colors ${
                                lead["Stop outreach"]
                                  ? "bg-red-50 hover:bg-red-100"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {lead.FirstName.charAt(0)}
                                        {lead.LastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lead.FirstName} {lead.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                      {lead.Title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {lead.Organization}
                                </div>
                                {lead.OrganizationSite && (
                                  <a
                                    href={lead.OrganizationSite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                                  {lead.Industry || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="space-y-1">
                                  {lead.Email && (
                                    <div className="flex items-center">
                                      <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`mailto:${lead.Email}`}
                                        className="text-purple-600 hover:text-purple-800 truncate max-w-xs"
                                      >
                                        {lead.Email}
                                      </a>
                                    </div>
                                  )}
                                  {lead.Phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                      <a
                                        href={`tel:${lead.Phone}`}
                                        className="text-purple-600 hover:text-purple-800"
                                      >
                                        {formatPhone(lead.Phone)}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                  {getStatusBadge(lead.STATUS)}
                                  {getTouchpointBadge(lead.TOUCHPOINT)}
                                  {lead["Stop outreach"] && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                      Stop Outreach
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                    {formatDate(lead.NEXT_TOUCH_DATE)}
                                  </div>
                                  {lead.LAST_TOUCH && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Last: {formatDate(lead.LAST_TOUCH)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  {lead.LinkedIn && (
                                    <a
                                      href={lead.LinkedIn}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-900 transition-colors"
                                      title="View LinkedIn Profile"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}

                                  {/* Stop Outreach Button */}
                                  {lead["Stop outreach"] ? (
                                    <div
                                      className="flex items-center text-red-600"
                                      title="Outreach stopped"
                                    >
                                      <StopCircle className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">
                                        Stopped
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="relative group">
                                      <button
                                        onClick={() =>
                                          stopLoanOfficerOutreach(
                                            lead.Email,
                                            `${lead.FirstName} ${lead.LastName}`
                                          )
                                        }
                                        disabled={
                                          stoppingLoanOfficerOutreach.has(
                                            lead.Email
                                          ) || !lead.Email
                                        }
                                        className="flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          !lead.Email
                                            ? "No email available"
                                            : "Stop outreach for this lead"
                                        }
                                      >
                                        {stoppingLoanOfficerOutreach.has(
                                          lead.Email
                                        ) ? (
                                          <>
                                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                                            Stopping...
                                          </>
                                        ) : (
                                          <>
                                            <StopCircle className="w-3 h-3 mr-1" />
                                            Stop
                                          </>
                                        )}
                                      </button>
                                      {!lead.Email && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                          No email available
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Loan Officer Pagination */}
                    {totalLoanOfficerItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startLoanOfficerIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(
                                  endLoanOfficerIndex,
                                  totalLoanOfficerItems
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {totalLoanOfficerItems}
                              </span>{" "}
                              results
                            </span>
                          </div>

                          {totalLoanOfficerPages > 1 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToLoanOfficerPrevious}
                                disabled={currentLoanOfficerPage === 1}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {Array.from(
                                  {
                                    length: Math.min(5, totalLoanOfficerPages),
                                  },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalLoanOfficerPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentLoanOfficerPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentLoanOfficerPage >=
                                      totalLoanOfficerPages - 2
                                    ) {
                                      pageNum = totalLoanOfficerPages - 4 + i;
                                    } else {
                                      pageNum = currentLoanOfficerPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() =>
                                          goToLoanOfficerPage(pageNum)
                                        }
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                          currentLoanOfficerPage === pageNum
                                            ? "bg-purple-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}

                                {totalLoanOfficerPages > 5 &&
                                  currentLoanOfficerPage <
                                    totalLoanOfficerPages - 2 && (
                                    <>
                                      <span className="text-gray-500">...</span>
                                      <button
                                        onClick={() =>
                                          goToLoanOfficerPage(
                                            totalLoanOfficerPages
                                          )
                                        }
                                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        {totalLoanOfficerPages}
                                      </button>
                                    </>
                                  )}
                              </div>

                              <button
                                onClick={goToLoanOfficerNext}
                                disabled={
                                  currentLoanOfficerPage ===
                                  totalLoanOfficerPages
                                }
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "commercialBankers" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Commercial Bankers & Lenders
                </h2>
                <p className="text-sm text-gray-600">
                  Total: {totalCommercialBankersItems || 0} leads
                </p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="commercial-bankers-search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search by Name, Email, or Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="commercial-bankers-search"
                          value={commercialBankersSearchTerm}
                          onChange={(e) =>
                            setCommercialBankersSearchTerm(e.target.value)
                          }
                          placeholder="Search leads..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <label
                        htmlFor="commercial-bankers-outreach-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outreach Status
                      </label>
                      <select
                        id="commercial-bankers-outreach-filter"
                        value={commercialBankersOutreachFilter}
                        onChange={(e) =>
                          setCommercialBankersOutreachFilter(
                            e.target.value as "all" | "running" | "stopped"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="all">All Leads</option>
                        <option value="running">Running Outreach</option>
                        <option value="stopped">Stopped Outreach</option>
                      </select>
                    </div>
                  </div>
                </div>

                {commercialBankersLeads.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading Commercial Bankers leads...
                    </span>
                  </div>
                ) : commercialBankersLeads.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">
                      {commercialBankersLeads.error}
                    </p>
                    <button
                      onClick={fetchCommercialBankersLeads}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Industry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Next Touch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentCommercialBankersLeads.map((lead) => (
                            <tr
                              key={lead.row_number}
                              className={`hover:bg-gray-50 transition-colors ${
                                lead["Stop outreach"]
                                  ? "bg-red-50 hover:bg-red-100"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {lead.FirstName.charAt(0)}
                                        {lead.LastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lead.FirstName} {lead.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                      {lead.Title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {lead.Organization}
                                </div>
                                {lead.OrganizationSite && (
                                  <a
                                    href={lead.OrganizationSite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-orange-600 hover:text-orange-800 flex items-center mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {lead.Industry}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center mb-1">
                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                    <a
                                      href={`mailto:${lead.Email}`}
                                      className="text-orange-600 hover:text-orange-800"
                                    >
                                      {lead.Email}
                                    </a>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-gray-900">
                                      {formatPhone(lead.Phone)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(lead.STATUS)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDate(lead.NEXT_TOUCH_DATE)}
                                </div>
                                {getTouchpointBadge(lead.TOUCHPOINT)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {lead["Stop outreach"] ? (
                                  <span className="text-red-600 font-medium">
                                    Outreach Stopped
                                  </span>
                                ) : !lead.Email ? (
                                  <button
                                    disabled
                                    title="No email available"
                                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed transition-colors"
                                  >
                                    <StopCircle className="w-4 h-4 mr-1" />
                                    Stop Outreach
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      stopCommercialBankersOutreach(
                                        lead.Email,
                                        `${lead.FirstName} ${lead.LastName}`
                                      )
                                    }
                                    disabled={stoppingCommercialBankersOutreach.has(
                                      lead.Email
                                    )}
                                    className="flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {stoppingCommercialBankersOutreach.has(
                                      lead.Email
                                    ) ? (
                                      <>
                                        <Loader className="w-4 h-4 mr-1 animate-spin" />
                                        Stopping...
                                      </>
                                    ) : (
                                      <>
                                        <StopCircle className="w-4 h-4 mr-1" />
                                        Stop Outreach
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Commercial Bankers Pagination */}
                    {totalCommercialBankersItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startCommercialBankersIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(
                                  endCommercialBankersIndex,
                                  totalCommercialBankersItems
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {totalCommercialBankersItems}
                              </span>{" "}
                              results
                            </span>
                          </div>

                          {totalCommercialBankersPages > 1 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToCommercialBankersPrevious}
                                disabled={currentCommercialBankersPage === 1}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {Array.from(
                                  {
                                    length: Math.min(
                                      5,
                                      totalCommercialBankersPages
                                    ),
                                  },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalCommercialBankersPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentCommercialBankersPage <= 3
                                    ) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentCommercialBankersPage >=
                                      totalCommercialBankersPages - 2
                                    ) {
                                      pageNum =
                                        totalCommercialBankersPages - 4 + i;
                                    } else {
                                      pageNum =
                                        currentCommercialBankersPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() =>
                                          goToCommercialBankersPage(pageNum)
                                        }
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                          currentCommercialBankersPage ===
                                          pageNum
                                            ? "bg-orange-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}

                                {totalCommercialBankersPages > 5 &&
                                  currentCommercialBankersPage <
                                    totalCommercialBankersPages - 2 && (
                                    <>
                                      <span className="text-gray-500">...</span>
                                      <button
                                        onClick={() =>
                                          goToCommercialBankersPage(
                                            totalCommercialBankersPages
                                          )
                                        }
                                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        {totalCommercialBankersPages}
                                      </button>
                                    </>
                                  )}
                              </div>

                              <button
                                onClick={goToCommercialBankersNext}
                                disabled={
                                  currentCommercialBankersPage ===
                                  totalCommercialBankersPages
                                }
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "residentialRealtors" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Residential Realtors & Loan Officers
                </h2>
                <p className="text-sm text-gray-600">
                  Total: {totalResidentialRealtorsItems || 0} leads
                </p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="residential-realtors-search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search by Name, Email, or Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="residential-realtors-search"
                          value={residentialRealtorsSearchTerm}
                          onChange={(e) =>
                            setResidentialRealtorsSearchTerm(e.target.value)
                          }
                          placeholder="Search leads..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <label
                        htmlFor="residential-realtors-outreach-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Outreach Status
                      </label>
                      <select
                        id="residential-realtors-outreach-filter"
                        value={residentialRealtorsOutreachFilter}
                        onChange={(e) =>
                          setResidentialRealtorsOutreachFilter(
                            e.target.value as "all" | "running" | "stopped"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="all">All Leads</option>
                        <option value="running">Running Outreach</option>
                        <option value="stopped">Stopped Outreach</option>
                      </select>
                    </div>
                  </div>
                </div>

                {residentialRealtorsLeads.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading Residential Realtors leads...
                    </span>
                  </div>
                ) : residentialRealtorsLeads.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">
                      {residentialRealtorsLeads.error}
                    </p>
                    <button
                      onClick={fetchResidentialRealtorsLeads}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Industry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Next Touch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentResidentialRealtorsLeads.map((lead) => (
                            <tr
                              key={lead.row_number}
                              className={`hover:bg-gray-50 transition-colors ${
                                lead["Stop outreach"]
                                  ? "bg-red-50 hover:bg-red-100"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {lead.FirstName.charAt(0)}
                                        {lead.LastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {lead.FirstName} {lead.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                      {lead.Title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {lead.Organization}
                                </div>
                                {lead.OrganizationSite && (
                                  <a
                                    href={lead.OrganizationSite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-teal-600 hover:text-teal-800 flex items-center mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Website
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {lead.Industry}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center mb-1">
                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                    <a
                                      href={`mailto:${lead.Email}`}
                                      className="text-teal-600 hover:text-teal-800"
                                    >
                                      {lead.Email}
                                    </a>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-gray-900">
                                      {formatPhone(lead.Phone)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(lead.STATUS)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDate(lead.NEXT_TOUCH_DATE)}
                                </div>
                                {getTouchpointBadge(lead.TOUCHPOINT)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {lead["Stop outreach"] ? (
                                  <span className="text-red-600 font-medium">
                                    Outreach Stopped
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      stopResidentialRealtorsOutreach(
                                        lead.Email,
                                        `${lead.FirstName} ${lead.LastName}`
                                      )
                                    }
                                    disabled={stoppingResidentialRealtorsOutreach.has(
                                      lead.Email
                                    )}
                                    className="flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {stoppingResidentialRealtorsOutreach.has(
                                      lead.Email
                                    ) ? (
                                      <>
                                        <Loader className="w-4 h-4 mr-1 animate-spin" />
                                        Stopping...
                                      </>
                                    ) : (
                                      <>
                                        <StopCircle className="w-4 h-4 mr-1" />
                                        Stop Outreach
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Residential Realtors Pagination */}
                    {totalResidentialRealtorsItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startResidentialRealtorsIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(
                                  endResidentialRealtorsIndex,
                                  totalResidentialRealtorsItems
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {totalResidentialRealtorsItems}
                              </span>{" "}
                              results
                            </span>
                          </div>

                          {totalResidentialRealtorsPages > 1 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToResidentialRealtorsPrevious}
                                disabled={currentResidentialRealtorsPage === 1}
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {/* Show page numbers */}
                                {Array.from(
                                  {
                                    length: Math.min(
                                      5,
                                      totalResidentialRealtorsPages
                                    ),
                                  },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalResidentialRealtorsPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentResidentialRealtorsPage <= 3
                                    ) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentResidentialRealtorsPage >=
                                      totalResidentialRealtorsPages - 2
                                    ) {
                                      pageNum =
                                        totalResidentialRealtorsPages - 4 + i;
                                    } else {
                                      pageNum =
                                        currentResidentialRealtorsPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() =>
                                          goToResidentialRealtorsPage(pageNum)
                                        }
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                          currentResidentialRealtorsPage ===
                                          pageNum
                                            ? "bg-teal-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}

                                {totalResidentialRealtorsPages > 5 &&
                                  currentResidentialRealtorsPage <
                                    totalResidentialRealtorsPages - 2 && (
                                    <>
                                      <span className="text-gray-500">...</span>
                                      <button
                                        onClick={() =>
                                          goToResidentialRealtorsPage(
                                            totalResidentialRealtorsPages
                                          )
                                        }
                                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        {totalResidentialRealtorsPages}
                                      </button>
                                    </>
                                  )}
                              </div>

                              <button
                                onClick={goToResidentialRealtorsNext}
                                disabled={
                                  currentResidentialRealtorsPage ===
                                  totalResidentialRealtorsPages
                                }
                                className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
