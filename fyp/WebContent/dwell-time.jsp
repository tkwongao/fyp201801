<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"
	import="fyp.DatabaseConnection, java.io.*, java.util.*, javax.servlet.*, java.text.*"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description"
	content="A fully featured admin theme which can be used to build CRM, CMS, etc.">
<meta name="author" content="Coderthemes">

<link rel="shortcut icon" href="EEK/assets/images/favicon_1.ico">

<title>Minton - Responsive Admin Dashboard</title>

<link href="plugins/nvd3/build/nv.d3.min.css" rel="stylesheet"
	type="text/css" />

<link href="plugins/switchery/switchery.min.css" rel="stylesheet" />
<link href="EEK/assets/css/bootstrap.min.css" rel="stylesheet"
	type="text/css">
<link href="EEK/assets/css/core.css" rel="stylesheet" type="text/css">
<link href="EEK/assets/css/icons.css" rel="stylesheet" type="text/css">
<link href="EEK/assets/css/components.css" rel="stylesheet"
	type="text/css">
<link href="EEK/assets/css/pages.css" rel="stylesheet" type="text/css">
<link href="EEK/assets/css/menu.css" rel="stylesheet" type="text/css">
<link href="EEK/assets/css/responsive.css" rel="stylesheet"
	type="text/css">
<link
	href="plugins/mjolnic-bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css"
	rel="stylesheet">
<link href="plugins/bootstrap-daterangepicker/daterangepicker.css"
	rel="stylesheet">
<link href="EEK/assets/css/custom.css" rel="stylesheet" type="text/css">

<script src="EEK/assets/js/modernizr.min.js"></script>

<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
<!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->


</head>


<body class="fixed-left">

	<!-- Begin page -->
	<div id="wrapper">

		<!-- Top Bar Start -->
		<div class="topbar">

			<!-- LOGO -->
			<div class="topbar-left">
				<div class="text-center">
					<a href="./index.jsp" class="logo"><object id="logo"
							data="EEK/assets/images/logo.svg" type="image/svg+xml"
							height="80"></object></a>
				</div>
			</div>

			<!-- Navbar -->
			<div class="navbar navbar-default" role="navigation">
				<div class="container">
					<div class="">
						<div class="pull-left">
							<button class="button-menu-mobile open-left waves-effect">
								<i class="md md-menu"></i>
							</button>
							<span class="clearfix"></span>
						</div>

						<ul class="nav navbar-nav hidden-xs">

							<li class="dropdown"><a href="javascript:void(0);"
								class="dropdown-toggle waves-effect" data-toggle="dropdown"
								role="button" aria-haspopup="true" aria-expanded="false">Sites
									<span class="caret"></span>
							</a>
								<ul class="dropdown-menu">
									<li><a href="javascript:void(0);">Web design</a></li>
									<li><a href="javascript:void(0);">Projects two</a></li>
									<li><a href="javascript:void(0);">Graphic design</a></li>
									<li><a href="javascript:void(0);">Projects four</a></li>
								</ul></li>
						</ul>

						<form role="search"
							class="navbar-left app-search pull-left hidden-xs">
							<input type="text" placeholder="Search..."
								class="form-control app-search-input"> <a href=""><i
								class="fa fa-search"></i></a>
						</form>

						<ul class="nav navbar-nav navbar-right pull-right">

							<li class="dropdown hidden-xs"><a href="javascript:void(0);"
								data-target="#" class="dropdown-toggle waves-effect waves-light"
								data-toggle="dropdown" aria-expanded="true"> <i
									class="md md-notifications"></i> <span
									class="badge badge-xs badge-pink">3</span>
							</a>
								<ul class="dropdown-menu dropdown-menu-lg">
									<li class="text-center notifi-title">Notification</li>
									<li class="list-group nicescroll notification-list">
										<!-- list item--> <a href="javascript:void(0);"
										class="list-group-item">
											<div class="media">
												<div class="pull-left p-r-10">
													<em class="fa fa-diamond noti-primary"></em>
												</div>
												<div class="media-body">
													<h5 class="media-heading">A new order has been placed
														A new order has been placed</h5>
													<p class="m-0">
														<small>There are new settings available</small>
													</p>
												</div>
											</div>
									</a> <!-- list item--> <a href="javascript:void(0);"
										class="list-group-item">
											<div class="media">
												<div class="pull-left p-r-10">
													<em class="fa fa-cog noti-warning"></em>
												</div>
												<div class="media-body">
													<h5 class="media-heading">New settings</h5>
													<p class="m-0">
														<small>There are new settings available</small>
													</p>
												</div>
											</div>
									</a> <!-- list item--> <a href="javascript:void(0);"
										class="list-group-item">
											<div class="media">
												<div class="pull-left p-r-10">
													<em class="fa fa-bell-o noti-success"></em>
												</div>
												<div class="media-body">
													<h5 class="media-heading">Updates</h5>
													<p class="m-0">
														<small>There are <span class="text-primary">2</span>
															new updates available
														</small>
													</p>
												</div>
											</div>
									</a>

									</li>

									<li><a href="javascript:void(0);" class=" text-right">
											<small><b>See all notifications</b></small>
									</a></li>

								</ul></li>
							<li class="hidden-xs"><a href="javascript:void(0);"
								class="right-bar-toggle waves-effect waves-light"><i
									class="md md-settings"></i></a></li>

						</ul>
					</div>
					<!--/.nav-collapse -->
				</div>
			</div>
		</div>
		<!-- Top Bar End -->


		<!-- ========== Left Sidebar Start ========== -->
		<div class="left side-menu">
			<div class="sidebar-inner slimscrollleft">

				<div id="sidebar-menu">
					<ul>
						<li class="menu-title">Main</li>

						<li><a href="./index.jsp" class="waves-effect waves-primary">
								<i class="md md-home"></i><span>Home</span>
						</a></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i
								class="md md-access-time"></i><span>Realtime</span> <span
								class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="overview.html">Overview</a></li>
								<li><a href="map-view.html">Loactions</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-share"></i><span>
									Analytics </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="compare-location.html">Compare Location</a></li>
								<li><a href="compare-date.html">Compare Date</a></li>
								<li><a href="traffic.html">Traffic</a></li>
								<li><a href="dwell-time.jsp">Dwell Time</a></li>
								<li><a href="loyalty.jsp">Loyalty</a></li>
							</ul></li>


						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-palette"></i>
								<span> UI Kit </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="ui-buttons.html">Buttons</a></li>
								<li><a href="ui-panels.html">Panels</a></li>
								<li><a href="ui-portlets.html">Portlets</a></li>
								<li><a href="ui-checkbox-radio.html">Checkboxs-Radios</a></li>
								<li><a href="ui-tabs.html">Tabs & Accordions</a></li>
								<li><a href="ui-modals.html">Modals</a></li>
								<li><a href="ui-progressbars.html">Progress Bars</a></li>
								<li><a href="ui-notification.html">Notification</a></li>
								<li><a href="ui-bootstrap.html">BS Elements</a></li>
								<li><a href="ui-typography.html">Typography</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i
								class="md md-invert-colors-on"></i><span> Components </span> <span
								class="label label-success pull-right">6</span> </a>
							<ul class="list-unstyled">
								<li><a href="components-grid.html">Grid</a></li>
								<li><a href="components-carousel.html">Carousel</a></li>
								<li><a href="components-widgets.html">Widgets</a></li>
								<li><a href="components-nestable-list.html">Nesteble</a></li>
								<li><a href="components-range-sliders.html">Range
										Sliders </a></li>
								<li><a href="components-sweet-alert.html">Sweet Alerts
								</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-redeem"></i>
								<span> Icons </span> <span class="menu-arrow"></span> </a>
							<ul class="list-unstyled">
								<li><a href="icons-glyphicons.html">Glyphicons</a></li>
								<li><a href="icons-materialdesign.html">Material Design</a></li>
								<li><a href="icons-themifyicon.html">Themify Icons</a></li>
								<li><a href="icons-ionicons.html">Ion Icons</a></li>
								<li><a href="icons-fontawesome.html">Font awesome</a></li>
								<li><a href="icons-weather.html">Weather Icons</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i
								class="md md-now-widgets"></i><span> Forms </span> <span
								class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="form-elements.html">General Elements</a></li>
								<li><a href="form-advanced.html">Advanced Form</a></li>
								<li><a href="form-validation.html">Form Validation</a></li>
								<li><a href="form-wizard.html">Form Wizard</a></li>
								<li><a href="form-wysiwig.html">WYSIWYG Editor</a></li>
								<li><a href="form-summernote.html">Summernote</a></li>
								<li><a href="form-uploads.html">Multiple File Upload</a></li>
								<li><a href="form-xeditable.html">X-editable</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-view-list"></i><span>
									Tables </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="tables-basic.html">Basic Tables</a></li>
								<li><a href="tables-datatable.html">Data Table</a></li>
								<li><a href="tables-editable.html">Editable Table</a></li>
								<li><a href="tables-responsive.html">Responsive Table</a></li>
								<li><a href="tables-tablesaw.html">Tablesaw Table</a></li>
								<li><a href="tables-foo-tables.html">Foo Table</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-poll"></i><span>
									Charts </span> <span class="menu-arrow"></span> </a>
							<ul class="list-unstyled">
								<li><a href="chart-flot.html">Flot Chart</a></li>
								<li><a href="chart-morris.html">Morris Chart</a></li>
								<li><a href="chart-chartist.html">Chartist chart</a></li>
								<li><a href="chart-nvd3.html">Nvd3 charts</a></li>
								<li><a href="chart-chartjs.html">Chartjs charts</a></li>
								<li><a href="chart-peity.html">Peity Charts</a></li>
								<li><a href="chart-sparkline.html">Sparkline Charts</a></li>
								<li><a href="chart-other.html">Other Chart</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-place"></i><span>
									Maps </span><span class="label label-primary pull-right">2</span></a>
							<ul class="list-unstyled">
								<li><a href="map-google.html"> Google Map</a></li>
								<li><a href="map-vector.html"> Vector Map</a></li>
							</ul></li>

						<li class="menu-title">More</li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-mail"></i><span>
									Mail </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="mail-inbox.html">Inbox</a></li>
								<li><a href="mail-compose.html">Compose Mail</a></li>
								<li><a href="mail-read.html">View Mail</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-pages"></i><span>
									Pages </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="pages-blank.html">Blank Page</a></li>
								<li><a href="pages-login.html">Login</a></li>
								<li><a href="pages-register.html">Register</a></li>
								<li><a href="pages-recoverpw.html">Recover Password</a></li>
								<li><a href="pages-lock-screen.html">Lock Screen</a></li>
								<li><a href="pages-confirmmail.html">Confirm Mail</a></li>
								<li><a href="pages-404.html">404 Error</a></li>
								<li><a href="pages-500.html">500 Error</a></li>
							</ul></li>

						<li class="has_sub"><a href="javascript:void(0);"
							class="waves-effect waves-primary"><i class="md md-layers"></i><span>
									Extras </span> <span class="menu-arrow"></span></a>
							<ul class="list-unstyled">
								<li><a href="extras-profile.html">Profile</a></li>
								<li><a href="extras-team.html">Team Members</a></li>
								<li><a href="extras-timeline.html">Timeline</a></li>
								<li><a href="extras-invoice.html">Invoice</a></li>
								<li><a href="extras-calendar.html">Calendar</a></li>
								<li><a href="extras-email-template.html">Email template</a></li>
								<li><a href="extras-maintenance.html">Maintenance</a></li>
								<li><a href="extras-coming-soon.html">Coming-soon</a></li>
								<li><a href="extras-gallery.html">Gallery</a></li>
								<li><a href="extras-pricing.html">Pricing</a></li>
								<li><a href="extras-faq.html">FAQ</a></li>
								<li><a href="extras-treeview.html">Treeview</a></li>
							</ul></li>



					</ul>


					<ul class="in_bottom">
						<li><a href="javascript:void(0);"
							class="waves-effect waves-primary"> <i class="md md-settings"></i><span>
									Setting </span></a></li>
					</ul>
					<div class="clearfix"></div>
				</div>

				<div class="clearfix"></div>
			</div>

			<div class="user-detail">
				<div class="dropup">
					<a href="" class="dropdown-toggle profile" data-toggle="dropdown"
						aria-expanded="true"> <img
						src="EEK/assets/images/users/avatar-2.jpg" alt="user-img"
						class="img-circle"> <span class="user-info-span">
							<h5 class="m-t-0 m-b-0">Hugo Mar</h5>
							<p class="text-muted m-b-0">
								<small><i class="fa fa-circle text-success"></i> <span>Online</span></small>
							</p>
					</span>
					</a>
					<ul class="dropdown-menu">
						<li><a href="javascript:void(0)"><i
								class="md md-face-unlock"></i> Profile</a></li>
						<li><a href="javascript:void(0)"><i
								class="md md-settings"></i> Settings</a></li>
						<li><a href="javascript:void(0)"><i class="md md-lock"></i>
								Lock screen</a></li>
						<li><a href="javascript:void(0)"><i
								class="md md-settings-power"></i> Logout</a></li>
					</ul>

				</div>
			</div>
		</div>
		<!-- Left Sidebar End -->



		<!-- ============================================================== -->
		<!-- Start right Content here -->
		<!-- ============================================================== -->
		<div class="content-page">
			<!-- Start content -->
			<div class="content">
				<div class="container">

					<!-- Page-Title -->
					<div class="row">
						<div class="col-sm-12">
							<div class="page-title-box">
								<h4 class="page-title pull-left">Welcome, Hugo Mar</h4>
								<!-- <div class="btn-group pull-right">
                                        <button type="button" class="btn btn-inverse dropdown-toggle waves-effect waves-light site-btn" data-toggle="dropdown" aria-expanded="false">K11 <span class="caret"></span></button>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a href="javascript:void(0);">K11</a></li>
                                            <li><a href="javascript:void(0);">HKUST</a></li>
                                            <li><a href="javascript:void(0);">The Base</a></li>
                                        </ul>
                                    </div> -->
								<h4 class="text-center no-margin">
									<script>
										document.write(new Intl.DateTimeFormat(
												"en-HK", {
													weekday : "long",
													year : "numeric",
													day : "numeric",
													month : "long"
												}).format(new Date()));
									</script>
								</h4>
							</div>
						</div>
					</div>

					<div class="row">
						<!-- <div class="col-sm-6 col-lg-6">
								<div class="card-box">
									<h4 class="m-t-0 m-b-20 header-title"><div class="text-center"><b>People Count</b></div></h4>

									<div class="widget-chart text-center">
										<div class="line-chart">
											<svg style="height:150px;"></svg>
										</div>
										
										<ul class="list-inline m-t-15">
											<li>
												<h4 class="text-muted m-t-20">Today</h4>
												<h3 class="m-b-0">1000</h3>
											</li>
											<li>
												<h4 class="text-muted m-t-20">Yesterday</h4>
												<h3 class="m-b-0">523</h3>
											</li>
											<li>
												<h4 class="text-muted m-t-20">Average</h4>
												<h3 class="m-b-0">965</h3>
											</li>
										</ul>
									</div>
								</div>
							</div> -->


						<!-- 	<div class="col-sm-6 col-lg-6">
								<div class="card-box">
									<h4 class="m-t-0 m-b-20 header-title"><div class="text-center"><b>Daily Average User Dwell Time</b></div></h4>
									
									<div class="widget-chart text-center">
										<div class="bar-chart">
											<svg style="height:400px;"></svg>
										</div>
										
										<ul class="list-inline m-t-15">
											<li>
												<h4 class="text-muted m-t-20">Today</h4>
												<h3 class="m-b-0">1000</h3>
											</li>
											<li>
												<h4 class="text-muted m-t-20">Yesterday</h4>
												<h3 class="m-b-0">523</h3>
											</li>
											<li>
												<h4 class="text-muted m-t-20">Average</h4>
												<h3 class="m-b-0">965</h3>
											</li>
										</ul>
									</div>
									
								</div>
							</div> -->

						<div class="col-lg-8">
							<div class="card-box">
								<div class="widget-chart text-center">
									<ul class="list-inline">
										<!-- 	<li>
												<h4 class="text-muted m-t-20">People Count</h4>
												<h3 class="m-b-0">1000</h3>
											</li> -->
										<li>
											<h4 class="text-muted m-t-20">Average Dwell Time</h4>
											<h3 class="m-b-0" id="avgDwellTime"></h3>
										</li>
										<!-- 	<li>
												<h4 class="text-muted m-t-20">Number of Visit</h4>
												
												<h3 class="m-b-0">965</h3>
											</li> -->

										<!-- <li>
												<h4 class="text-muted m-t-20">Retention Rate</h4>
												<h3 class="m-b-0">965</h3>
											</li> -->
									</ul>

									<div class="line-chart-second">
										<svg style="height: 400px;"></svg>
									</div>

									<div class="text-left m-t-20"
										style="border-top: 1px solid grey;">
										<div class="btn-group">
											<button type="button"
												class="btn btn-outline no-padding m-t-10"
												data-toggle="dropdown" aria-expanded="false">
												<span id="scope">Past Day</span> <span class="caret"></span>
											</button>
											<ul class="dropdown-menu" role="menu">
												<li><a href="javascript:changeScope(0, &quot;average&quot;);">Past Day</a></li>
												<li><a href="javascript:changeScope(1, &quot;average&quot;);">Past 7
														Days</a></li>
												<li><a href="javascript:changeScope(2, &quot;average&quot;);">Past Month</a></li>
												<li><a href="javascript:changeScope(3, &quot;average&quot;);">Past 3
														Month</a></li>
												<li><a href="javascript:changeScope(4, &quot;average&quot;);">Past Year</a></li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="col-lg-4">
							<div class="card-box">

								<div class="clearfix">
									<h4 class="m-t-0 header-title">
										<b>People Count</b>
									</h4>
									<span class="m-t-10 dropcap text-primary">100</span>
								</div>

								<div class="clearfix">
									<h4 class="m-t-40 header-title">
										<b>Average Dwell Time</b>
									</h4>
									<div class="bar-chart-second">
										<svg style="height: 220px;"></svg>
									</div>
								</div>
								<!-- 
									<div class="clearfix">
										<h4 class="m-t-10 header-title"><b>Top Shop List</b></h4>
										<table class="table">
											<thead>
												<tr>
													<td>Top Shop</th>
													<td align="right">Visitors</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>Nike</td>
													<td align="right">300</td>
												</tr>
												<tr>
													<td>Apple</td>
													<td align="right">200</td>
												</tr>
												<tr>
													<td>Samsung</td>
													<td align="right">100</td>
												</tr>
											</tbody>
										</table>
									</div> -->
							</div>
						</div>
					</div>



				</div>
				<!-- end container -->

			</div>
			<!-- end content -->



			<!-- FOOTER -->
			<footer class="footer text-right"> 2017 © P-Sense. </footer>
			<!-- End FOOTER -->

		</div>
		<!-- ============================================================== -->
		<!-- End Right content here -->
		<!-- ============================================================== -->


		<!-- Right Sidebar -->
		<div class="side-bar right-bar">
			<div class="nicescroll">
				<ul class="nav nav-tabs tabs">
					<li class="active tab"><a href="#home-2" data-toggle="tab"
						aria-expanded="false"> <span class="visible-xs"><i
								class="fa fa-home"></i></span> <span class="hidden-xs">Activity</span>
					</a></li>
					<li class="tab"><a href="#profile-2" data-toggle="tab"
						aria-expanded="false"> <span class="visible-xs"><i
								class="fa fa-user"></i></span> <span class="hidden-xs">Chat</span>
					</a></li>
					<li class="tab"><a href="#messages-2" data-toggle="tab"
						aria-expanded="true"> <span class="visible-xs"><i
								class="fa fa-envelope-o"></i></span> <span class="hidden-xs">Settings</span>
					</a></li>
				</ul>
				<div class="tab-content">
					<div class="tab-pane fade in active" id="home-2">
						<div class="timeline-2">
							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">5 minutes ago</small>
									<p>
										<strong><a href="javascript:void(0);"
											class="text-info">John Doe</a></strong> Uploaded a photo <strong>"DSC000586.jpg"</strong>
									</p>
								</div>
							</div>

							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">30 minutes ago</small>
									<p>
										<a href="" class="text-info">Lorem</a> commented your post.
									</p>
									<p>
										<em>"Lorem ipsum dolor sit amet, consectetur adipiscing
											elit. Aliquam laoreet tellus ut tincidunt euismod. "</em>
									</p>
								</div>
							</div>

							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">59 minutes ago</small>
									<p>
										<a href="" class="text-info">Jessi</a> attended a meeting with<a
											href="javascript:void(0);" class="text-success">John Doe</a>.
									</p>
									<p>
										<em>"Lorem ipsum dolor sit amet, consectetur adipiscing
											elit. Aliquam laoreet tellus ut tincidunt euismod. "</em>
									</p>
								</div>
							</div>

							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">1 hour ago</small>
									<p>
										<strong><a href="javascript:void(0);"
											class="text-info">John Doe</a></strong>Uploaded 2 new photos
									</p>
								</div>
							</div>

							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">3 hours ago</small>
									<p>
										<a href="" class="text-info">Lorem</a> commented your post.
									</p>
									<p>
										<em>"Lorem ipsum dolor sit amet, consectetur adipiscing
											elit. Aliquam laoreet tellus ut tincidunt euismod. "</em>
									</p>
								</div>
							</div>

							<div class="time-item">
								<div class="item-info">
									<small class="text-muted">5 hours ago</small>
									<p>
										<a href="" class="text-info">Jessi</a> attended a meeting with<a
											href="javascript:void(0);" class="text-success">John Doe</a>.
									</p>
									<p>
										<em>"Lorem ipsum dolor sit amet, consectetur adipiscing
											elit. Aliquam laoreet tellus ut tincidunt euismod. "</em>
									</p>
								</div>
							</div>
						</div>
					</div>



					<div class="tab-pane fade" id="profile-2">
						<div class="contact-list nicescroll">
							<ul class="list-group contacts-list">
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-1.jpg" alt="">
										</div> <span class="name">Chadengle</span> <i
										class="fa fa-circle online"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-2.jpg" alt="">
										</div> <span class="name">Tomaslau</span> <i
										class="fa fa-circle online"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-3.jpg" alt="">
										</div> <span class="name">Stillnotdavid</span> <i
										class="fa fa-circle online"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-4.jpg" alt="">
										</div> <span class="name">Kurafire</span> <i
										class="fa fa-circle online"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-5.jpg" alt="">
										</div> <span class="name">Shahedk</span> <i
										class="fa fa-circle away"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-6.jpg" alt="">
										</div> <span class="name">Adhamdannaway</span> <i
										class="fa fa-circle away"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-7.jpg" alt="">
										</div> <span class="name">Ok</span> <i class="fa fa-circle away"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-8.jpg" alt="">
										</div> <span class="name">Arashasghari</span> <i
										class="fa fa-circle offline"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-9.jpg" alt="">
										</div> <span class="name">Joshaustin</span> <i
										class="fa fa-circle offline"></i>
								</a> <span class="clearfix"></span></li>
								<li class="list-group-item"><a href="javascript:void(0);">
										<div class="avatar">
											<img src="EEK/assets/images/users/avatar-10.jpg" alt="">
										</div> <span class="name">Sortino</span> <i
										class="fa fa-circle offline"></i>
								</a> <span class="clearfix"></span></li>
							</ul>
						</div>
					</div>



					<div class="tab-pane fade" id="messages-2">

						<div class="row m-t-20">
							<div class="col-xs-8">
								<h5 class="m-0">Notifications</h5>
								<p class="text-muted m-b-0">
									<small>Do you need them?</small>
								</p>
							</div>
							<div class="col-xs-4 text-right">
								<input type="checkbox" checked data-plugin="switchery"
									data-color="#3bafda" data-size="small" />
							</div>
						</div>

						<div class="row m-t-20">
							<div class="col-xs-8">
								<h5 class="m-0">API Access</h5>
								<p class="m-b-0 text-muted">
									<small>Enable/Disable access</small>
								</p>
							</div>
							<div class="col-xs-4 text-right">
								<input type="checkbox" checked data-plugin="switchery"
									data-color="#3bafda" data-size="small" />
							</div>
						</div>

						<div class="row m-t-20">
							<div class="col-xs-8">
								<h5 class="m-0">Auto Updates</h5>
								<p class="m-b-0 text-muted">
									<small>Keep up to date</small>
								</p>
							</div>
							<div class="col-xs-4 text-right">
								<input type="checkbox" checked data-plugin="switchery"
									data-color="#3bafda" data-size="small" />
							</div>
						</div>

						<div class="row m-t-20">
							<div class="col-xs-8">
								<h5 class="m-0">Online Status</h5>
								<p class="m-b-0 text-muted">
									<small>Show your status to all</small>
								</p>
							</div>
							<div class="col-xs-4 text-right">
								<input type="checkbox" checked data-plugin="switchery"
									data-color="#3bafda" data-size="small" />
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
		<!-- /Right-bar -->

	</div>
	<!-- END wrapper -->



	<script>
		var resizefunc = [];
	</script>

	<!-- jQuery  -->
	<script src="EEK/assets/js/jquery.min.js"></script>
	<script src="EEK/assets/js/bootstrap.min.js"></script>
	<script src="EEK/assets/js/detect.js"></script>
	<script src="EEK/assets/js/fastclick.js"></script>
	<script src="EEK/assets/js/jquery.slimscroll.js"></script>
	<script src="EEK/assets/js/jquery.blockUI.js"></script>
	<script src="EEK/assets/js/waves.js"></script>
	<script src="EEK/assets/js/wow.min.js"></script>
	<script src="EEK/assets/js/jquery.nicescroll.js"></script>
	<script src="EEK/assets/js/jquery.scrollTo.min.js"></script>
	<script src="plugins/switchery/switchery.min.js"></script>


	<script src="EEK/assets/js/fypGlobalVariables.js"></script>

	<!-- Nvd3 js -->
	<script src="plugins/d3/d3.min.js"></script>
	<script src="plugins/nvd3/build/nv.d3.min.js"></script>
	<script src="EEK/assets/pages/jquery.nvd3.init.js"></script>

	<script src="plugins/moment/moment.js"></script>
	<script
		src="plugins/mjolnic-bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js"></script>
	<script src="plugins/bootstrap-daterangepicker/daterangepicker.js"></script>

	<script src="EEK/assets/js/jquery.core.js"></script>
	<script src="EEK/assets/js/jquery.app.js"></script>

	<script src="EEK/assets/js/fypConnectForBackend.js"></script>

	<script type="text/javascript">
		$(document).ready(function() {
			changeScope(0, "average");
		});
	</script>
</body>
</html>