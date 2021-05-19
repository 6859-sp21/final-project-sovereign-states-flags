class WalkthroughTooltip {
  constructor(node, closesCallback, flagPreview) {
    this.node = node;
    this.closesCallback = closesCallback;
    this.flagPreview = flagPreview;
  }
  show(el, tooltipHtml, mode="NE") {
    // mode describes, cardinally, the relative positioning of this tooltip to el.
    tooltipHtml = `<div class="closeButtonContainer"><button id="tooltip-close-button" class="closeButton"><span class="close-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" enable-background="new 0 0 40 40">
        <line x1="0" y1="0" x2="40" y2="40" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10"></line>
        <line x1="40" y1="0" x2="0" y2="40" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10"></line>    
      </svg>
    </span></button></div>
    <div style="padding:0px 15px;">${tooltipHtml}</div>`
    const elRect = el.getBoundingClientRect()
    let tx = elRect.right;
    let ty = elRect.top;
    let tdelta = "";
    if (mode == "SE") {
      ty = elRect.bottom;
      tdelta = "translate(28px, -100%)"
    }

    this.node
      .style("display", "block");
    this.node.transition()
      .duration(200)
      .style("opacity", .9);
    this.node.html(tooltipHtml)
      .style("left", (tx) + "px")
      .style("color", "#000")
      .style("top", (ty - 28) + "px")
      .style("transform", tdelta);

    // Special to insights
    const flagPreview = this.flagPreview;
    const insightHovers = this.node.selectAll(".insight-hover")
      .each(function(d, i) {
        this.addEventListener("mouseover", () => flagPreview.show(this.dataset.country));
      });

    const closeButton = this.node.select("#tooltip-close-button");
    const tooltip = this;
    closeButton
      .on('click', function onEvent(e) {
        tooltip.closesCallback();
      });
  }
  setWiggle(wiggle) {
    if (wiggle) {
      this.node.node().classList.add('walkthrough-prompting');
    } else {
      this.node.node().classList.remove('walkthrough-prompting');
    }
  }
  // move(event) {
  //   this.node.style("left", (event.pageX) + "px")
  //     .style("top", (event.pageY - 28) + "px");
  // }
  hide() {
    this.node
      .style("display", "none");
    this.node.transition()
      .duration(500)
      .style("opacity", 0);
  }
}

class WalkthroughManager {
  constructor() {
    // this.dataMap = dataMap;
    // this.flagData = flagData;
    // this.dataJoinCallback = dataJoinCallback;

    this.walkthroughActive = true;
    this.walkthroughStep = 0;
    this.birthCountry = ""; // step 1
    this.similarCountry = ""; // step 2

    // Load persisted settings
    if (window.localStorage.getItem("walkthroughActive") == "false") {
      this.walkthroughActive = false
    }
  }
  setElement(settingsButton, settingsPanelContainer, aboutButton, aboutPanelContainer, walkthroughTooltipDiv, insightTooltipDiv, flagPreview) {
    if (this.settingsButton && this.settingsPanelContainer && this.walkthroughTooltipDiv) {
      return;
    }
    const settingsPanelCloseButton = settingsPanelContainer.select("#settings-panel-close-button");
    const aboutPanelCloseButton = aboutPanelContainer.select("#about-panel-close-button");
    const toggleWalkthroughCheckbox = settingsPanelContainer.select("#toggle-walkthrough-window-checkbox");
    const walkthroughTooltip = new WalkthroughTooltip(walkthroughTooltipDiv, () => this.stopWalkthrough(), flagPreview);
    const insightTooltip = new WalkthroughTooltip(insightTooltipDiv, () => this.hideInsight(), flagPreview);

    const manager = this; // necessary for inside the below event callbacks
    this.settingsButton = settingsButton;
    this.settingsPanelContainer = settingsPanelContainer;
    this.aboutButton = aboutButton;
    this.aboutPanelContainer = aboutPanelContainer;
    this.walkthroughTooltipDiv = walkthroughTooltipDiv;
    this.insightTooltipDiv = insightTooltipDiv;
// Settings Panel
    this.settingsPanelCloseButton = settingsPanelCloseButton;
    this.toggleWalkthroughCheckbox = toggleWalkthroughCheckbox;

    this.aboutPanelCloseButton = aboutPanelCloseButton;
// Tooltips
    this.walkthroughTooltip = walkthroughTooltip;
    this.insightTooltip = insightTooltip;
    this.flagPreview = flagPreview

// Persisted settings
    this.toggleWalkthroughCheckbox.node().checked = this.walkthroughActive;


// Event Handlers
    this.settingsButton
      .on('focus', function onEvent(e) {
        settingsPanelContainer.node().classList.add("target");
      });
    this.settingsPanelCloseButton
      .on('click', function onEvent(e) {
        settingsPanelContainer.node().classList.remove("target");
      });
    this.aboutButton
      .on('focus', function onEvent(e) {
        aboutPanelContainer.node().classList.add("target");
      });
    this.aboutPanelCloseButton
      .on('click', function onEvent(e) {
        aboutPanelContainer.node().classList.remove("target");
      });
    this.toggleWalkthroughCheckbox
      .on('input', function onEvent(e) {
        manager.walkthroughActive = e.target.checked;
        window.localStorage.setItem("walkthroughActive", manager.walkthroughActive);
        if (e.target.checked) {
          // manager.checkWalkthrough(false);
          manager.setWalkthrough(1);
        } else {
          manager.walkthroughTooltip.hide();
        }
      });
  }
  stopWalkthrough() {
    this.walkthroughTooltip.hide();
    this.walkthroughActive = false;
    window.localStorage.setItem("walkthroughActive", this.walkthroughActive);
    this.toggleWalkthroughCheckbox.node().checked = false;
  }
  hideInsight() {
    this.insightTooltip.hide();
  }
  checkWalkthrough(retry) {
    const ready = document.getElementById("search-bar").classList.contains("walkthroughReady");
    if(ready == false) {
      if (retry) {
        window.setTimeout(() => this.checkWalkthrough(true), 100); /* this checks the flag every 100 milliseconds*/
      }
    } else {
      this.setWalkthrough(1);
    }
  }
  setWalkthrough(step, data) {
    if (!this.walkthroughActive) return;

    this.walkthroughStep = step;

    const manager = this; // necessary for inside the below event callbacks
    if (step == 1) {
      this.walkthroughTooltip.show(
        document.getElementById("search-bar"),
        "<p class='walkthrough-question'>In what country where you born?</p>"
      );
      this.walkthroughTooltip.setWiggle(true);
    } else if (step == 1.5) {
      this.birthCountry = data;
      this.walkthroughTooltip.show(
        document.getElementById("search-bar"),
        `<p class='walkthrough-question'>In what country where you born?</p>
        <p class='walkthrough-answer'>${this.birthCountry}</p>`
      );
      this.walkthroughTooltip.setWiggle(false);
    } else if (step == 2) {
      this.walkthroughTooltip.show(
        document.querySelector("#top-similar-countries li"),
        `<p class='walkthrough-question'>What country's flag is most similar to ${this.birthCountry}'s?</p>`
      );
      this.walkthroughTooltip.setWiggle(true);
    } else if (step == 2.5) {
      this.similarCountry = data;
      this.walkthroughTooltip.show(
        document.querySelector("#top-similar-countries li"),
        `<p class='walkthrough-question'>What country's flag is most similar to ${this.birthCountry}'s?</p>
        <p class='walkthrough-answer'>${this.similarCountry}</p>`
      );
      this.walkthroughTooltip.setWiggle(false);
    } else {
      return;
    }
  }
  dataJoin(activeCountry, detailQuery) {
    if (this.walkthroughStep == 1 && activeCountry) {
      this.setWalkthrough(1.5, activeCountry.name);
      window.setTimeout(() => this.setWalkthrough(2), 2000);
    }

    if (detailQuery && insightsTitleMap.has(detailQuery)) {
      const insightTitle = insightsTitleMap.get(detailQuery);
      const insightHtml = insightsContentMap.get(detailQuery);
      this.insightTooltip.show(
        document.getElementById("left-panel"),
        `<p class='walkthrough-question'>${insightTitle}</p>
        <p class='walkthrough-answer'>${insightHtml}</p>`,
        "SE"
      );
    }
  }
  topCountryCallback(activeCountry) {
    if (this.walkthroughStep == 2) {
      this.setWalkthrough(2.5, activeCountry.name);
      // window.setTimeout(() => this.setWalkthrough(3), 2000);
    }
  }
  hide() {
    // this.g.attr("display", "none");
    // if (this.e) {
    //   this.e.style.backgroundImage = "";
    // }
  }
}

createTextual = async function() {
  // const world = await _world();
  // const countries = await _countries();
  // const flagData = await _flagData();
  // const flagMetadataMap = await _flagMetadataMap();

  const walkthroughManager = new WalkthroughManager();

  return {
    walkthroughManager: walkthroughManager
  };
}